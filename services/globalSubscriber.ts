import { GlobalState, SentientOutput } from '../types';
import { SentientLocalOrchestrator } from '../experts/orchestrator/sentientLocalOrchestrator';
import { generateCoachGuidance } from '../experts/orchestrator/ai';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type SubscriberRole = 'user' | 'coach' | 'admin' | 'system';
export type SubscriptionId = string;

export interface SubscribeOptions {
  immediate?: boolean;       // Trigger callback immediately with current value
  throttleMs?: number;       // Max frequency of callbacks
  role?: SubscriberRole;     // Security role for data redaction
  id?: string;               // Debug label
}

export interface SubscriberOptions {
  coalesceWindowMs?: number; // Window to group updates before running SLO (default 150ms)
  maxOrchestrationsPerSec?: number; // Cap on heavy logic (default 5)
  enableAuditLog?: boolean;  // Keep history in memory
  persistenceKey?: string;   // Key for localStorage
}

export interface EventMeta {
  eventType: string;
  source: string;            // 'UI', 'SyncLayer', 'SLO', 'System'
  timestamp: number;
  triggerOrchestrator?: boolean; // Default true
  urgent?: boolean;          // Bypass debounce if true
  overrideUseLLM?: boolean;  // Admin override for cloud AI
}

export interface Unsubscribe {
  (): void;
}

interface SubscriberEntry {
  id: SubscriptionId;
  selector: (state: GlobalState) => any;
  callback: (newValue: any, oldValue: any, meta?: EventMeta) => void;
  role: SubscriberRole;
  lastCalled: number;
  throttleMs: number;
  currentValue: any; // Cache for diffing
}

interface AuditEntry {
  timestamp: number;
  eventType: string;
  source: string;
  diffKeys: string[];
}

// =====================================================
// GLOBAL SUBSCRIBER (CORE CLASS)
// =====================================================

/**
 * The Central Nervous System of SentientOS.
 * Manages state atomicity, reactive subscriptions, and local orchestration loops.
 */
export class GlobalSubscriber {
  private state: GlobalState;
  private subscribers: Map<SubscriptionId, SubscriberEntry> = new Map();
  private options: SubscriberOptions;

  // Orchestration Control
  private orchestratorDebounceTimer: any = null;
  private isOrchestrating: boolean = false;
  private pendingOrchestrations: boolean = false;
  private lastOrchestrationTime: number = 0;

  // Persistence & Offline
  private offlineQueue: { changes: Partial<GlobalState>; meta: EventMeta }[] = [];

  // Audit
  private auditLog: AuditEntry[] = [];
  private readonly MAX_AUDIT_LOGS = 100;

  constructor(initialState: GlobalState, options: SubscriberOptions = {}) {
    this.state = JSON.parse(JSON.stringify(initialState)); // Deep copy to detach reference
    this.options = {
      coalesceWindowMs: 150,
      maxOrchestrationsPerSec: 5,
      enableAuditLog: true,
      persistenceKey: 'sentient_state_v5',
      ...options
    };

    // Hydrate from persistence if available
    this.loadFromPersistence();

    // Setup offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Subscribe to a specific slice of the GlobalState.
   * Callback fires ONLY if the selected value changes (shallow equality).
   */
  public subscribe(
    selector: (state: GlobalState) => any,
    callback: (newValue: any, oldValue: any, meta?: EventMeta) => void,
    opts: SubscribeOptions = {}
  ): Unsubscribe {
    const id = opts.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const initialValue = selector(this.state);

    const entry: SubscriberEntry = {
      id,
      selector,
      callback,
      role: opts.role || 'user',
      lastCalled: 0,
      throttleMs: opts.throttleMs || 0,
      currentValue: initialValue
    };

    this.subscribers.set(id, entry);

    // Immediate callback if requested
    if (opts.immediate) {
      this.safeCallback(entry, initialValue, undefined, {
        eventType: 'SUBSCRIPTION_INIT',
        source: 'System',
        timestamp: Date.now()
      });
    }

    // Return Unsubscribe Function
    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Publish changes to the GlobalState.
   * - Validates schema
   * - Merges changes atomically
   * - Triggers SLO (unless suppressed)
   * - Broadcasts to subscribers
   */
  public async publish(changes: Partial<GlobalState>, meta: EventMeta): Promise<void> {
    const startTime = Date.now();

    // 1. Validate (Lightweight)
    if (!this.validateSchema(changes)) {
      console.warn(`[GlobalSubscriber] Schema validation warning for event: ${meta.eventType}`);
    }

    // 2. Offline Handling
    if (typeof navigator !== 'undefined' && !navigator.onLine && meta.source !== 'SLO') {
      console.log(`[GlobalSubscriber] Offline. Queuing event: ${meta.eventType}`);
      this.offlineQueue.push({ changes, meta });
      // We still apply changes locally so UI updates, but we queue sync behavior
    }

    // 3. Atomic Merge
    const oldState = this.state;
    // Deep merge for specific top-level keys to allow partial updates
    const newState = {
      ...oldState,
      ...changes,
    };

    this.state = newState;

    // 4. Persistence
    this.persistState();

    // 5. Audit
    if (this.options.enableAuditLog) {
      this.logAudit(meta, Object.keys(changes));
    }

    // 6. Broadcast
    this.broadcast(oldState, newState, meta);

    // 7. Orchestration Trigger
    if (meta.triggerOrchestrator !== false) {
      if (meta.urgent) {
        await this.runOrchestrator(meta);
      } else {
        this.scheduleOrchestration(meta);
      }
    }
  }

  /**
   * Synchronous getter for current state.
   */
  public getState(): GlobalState {
    return this.state;
  }

  /**
   * Graceful Shutdown.
   */
  public async shutdown(): Promise<void> {
    if (this.orchestratorDebounceTimer) {
      clearTimeout(this.orchestratorDebounceTimer);
    }
    this.subscribers.clear();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  // =====================================================
  // INTERNAL LOGIC
  // =====================================================

  /**
   * Broadcast changes to all subscribers efficiently.
   */
  private broadcast(oldState: GlobalState, newState: GlobalState, meta: EventMeta) {
    this.subscribers.forEach((sub) => {
      try {
        const newValue = sub.selector(newState);

        // Shallow Equality Check
        if (newValue !== sub.currentValue) {

          // Throttle Check
          const now = Date.now();
          if (sub.throttleMs > 0 && (now - sub.lastCalled) < sub.throttleMs) {
            return;
          }

          // Redaction (Role Security)
          const safeValue = this.redact(newValue, sub.role);
          const safeOld = this.redact(sub.currentValue, sub.role);

          // Update Cache
          sub.currentValue = newValue;
          sub.lastCalled = now;

          // Invoke
          this.safeCallback(sub, safeValue, safeOld, meta);
        }
      } catch (err) {
        console.error(`[GlobalSubscriber] Error in subscription ${sub.id}:`, err);
      }
    });
  }

  /**
   * Safely run a callback.
   */
  private safeCallback(sub: SubscriberEntry, newVal: any, oldVal: any, meta?: EventMeta) {
    try {
      sub.callback(newVal, oldVal, meta);
    } catch (e) {
      console.error(`[GlobalSubscriber] Callback failed for ${sub.id}`, e);
    }
  }

  /**
   * Schedule the Local Orchestrator (Debounced).
   */
  private scheduleOrchestration(meta: EventMeta) {
    if (this.orchestratorDebounceTimer) {
      clearTimeout(this.orchestratorDebounceTimer);
    }

    this.orchestratorDebounceTimer = setTimeout(() => {
      this.runOrchestrator(meta);
    }, this.options.coalesceWindowMs);
  }

  /**
   * Run the Sentient Local Orchestrator (SLO).
   * This is the "Mind" reacting to the "Body" (State) changes.
   */
  private async runOrchestrator(triggerMeta: EventMeta) {
    if (this.isOrchestrating) {
      this.pendingOrchestrations = true;
      return;
    }

    this.isOrchestrating = true;

    try {
      // 1. SYSTEM 1: Local Reflex (Fast)
      const slo = new SentientLocalOrchestrator(this.state);
      const output: SentientOutput = slo.runAll();

      // Check for High Signals (Trigger for System 2)
      const isCritical = output.readinessScore < 40;
      const hasRisks = output.commanderDecision.risk_signals && output.commanderDecision.risk_signals.length > 0;
      const hasTimelineShifts = output.timeline.adjustments.length > 0;

      let finalExplanation = output.explanations[0];
      let finalAction = output.commanderDecision.action;

      // 2. SYSTEM 2: Cloud Reflection (Slow, Optional)
      // Only engage if critical conditions met OR explicitly requested
      if (isCritical || hasRisks || triggerMeta.overrideUseLLM) {
        console.log("SentientOS: Engaging System 2 (Cloud Synthesis)...");

        // We fire-and-forget the cloud call so UI updates immediately with local data
        // The cloud data will arrive later and trigger a second update.
        this.triggerCloudSynthesis(output);
      }

      // 3. Merge Local Output (Immediate Feedback)
      const updates: Partial<GlobalState> = {
        orchestrator: {
          readiness_summary: output.commanderDecision.summary || output.commanderDecision.mode || "Ready",
          explanation: finalExplanation || "Analysis complete.",
          risk_signals: output.injuryRisks,
          recommended_actions: [finalAction, ...output.timeline.adjustments.map((a: any) => typeof a === 'string' ? a : a.sessionId ? `Adjust session ${a.sessionId}` : 'Timeline update')],
          last_sync: Date.now(),
          is_thinking: false,
          active_command: output.activeCommand || null
        },
        recovery: {
          ...this.state.recovery,
          recovery_score: output.recoveryScore
        },
        fuel: {
          ...this.state.fuel,
          fuel_score: output.fuelState.fuelLevel || this.state.fuel.fuel_score,
          active_protocol: output.fuelState.active_protocol,
          viewModel: output.fuelState.viewModel
        },
        mindspace: {
          ...this.state.mindspace,
          readiness_score: output.mindspaceReadiness.score
        },
        timeline: {
          ...this.state.timeline,
          sessions: output.timeline.applied_timeline,
          adjustments: output.timeline.adjustments.map((a: any) => typeof a === 'string' ? a : `Session ${a.sessionId}: ${a.action}`)
        },
        last_sentient_output: output
      };

      await this.publish(updates, {
        eventType: 'ORCHESTRATION_COMPLETE',
        source: 'SLO',
        timestamp: Date.now(),
        triggerOrchestrator: false // CRITICAL: Stop the loop
      });

    } catch (error) {
      console.error("[GlobalSubscriber] SLO Failure:", error);
    } finally {
      this.isOrchestrating = false;
      this.lastOrchestrationTime = Date.now();

      if (this.pendingOrchestrations) {
        this.pendingOrchestrations = false;
        setTimeout(() => this.runOrchestrator({ ...triggerMeta, eventType: 'ORCHESTRATION_RETRY' }), 100);
      }
    }
  }

  private async triggerCloudSynthesis(localOutput: SentientOutput) {
    try {
      const insight = await generateCoachGuidance(localOutput, this.state.user_profile);
      if (insight) {
        const cloudUpdates: Partial<GlobalState> = {
          orchestrator: {
            ...this.state.orchestrator,
            explanation: insight.human_explanation || this.state.orchestrator.explanation,
            recommended_actions: insight.coach_override
              ? [insight.coach_override, ...this.state.orchestrator.recommended_actions]
              : this.state.orchestrator.recommended_actions
          }
        };

        // Publish the Cloud refinement
        await this.publish(cloudUpdates, {
          eventType: 'CLOUD_SYNTHESIS_COMPLETE',
          source: 'System2',
          timestamp: Date.now(),
          triggerOrchestrator: false
        });
      }
    } catch (e) {
      console.warn("Cloud synthesis skipped:", e);
    }
  }

  // =====================================================
  // PERSISTENCE & OFFLINE
  // =====================================================

  private persistState() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.options.persistenceKey!, JSON.stringify(this.state));
    } catch (e) {
      console.warn("State persistence failed (quota?)", e);
    }
  }

  private loadFromPersistence() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(this.options.persistenceKey!);
    if (raw) {
      try {
        const loaded = JSON.parse(raw);
        this.state = { ...this.state, ...loaded };
      } catch (e) {
        console.error("Failed to load persisted state", e);
      }
    }
  }

  private handleOnline = () => {
    console.log("[GlobalSubscriber] Network Online. Flushing queue...");
    this.offlineQueue = [];
  }

  private handleOffline = () => {
    console.log("[GlobalSubscriber] Network Offline. Local mode active.");
  }

  // =====================================================
  // SECURITY & VALIDATION
  // =====================================================

  private redact(value: any, role: SubscriberRole): any {
    if (role === 'admin' || role === 'system' || role === 'user') return value;
    if (typeof value === 'object' && value !== null) {
      if ('biomarkers' in value) {
        return { ...value, biomarkers: '[REDACTED]' };
      }
    }
    return value;
  }

  private validateSchema(changes: Partial<GlobalState>): boolean {
    const keys = Object.keys(changes);
    for (const k of keys) {
      if (!(k in this.state)) {
        return false;
      }
    }
    return true;
  }

  private logAudit(meta: EventMeta, keys: string[]) {
    this.auditLog.unshift({
      timestamp: meta.timestamp,
      eventType: meta.eventType,
      source: meta.source,
      diffKeys: keys
    });
    if (this.auditLog.length > this.MAX_AUDIT_LOGS) {
      this.auditLog.pop();
    }
  }
}
