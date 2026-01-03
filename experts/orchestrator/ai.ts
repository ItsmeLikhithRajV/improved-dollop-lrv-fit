
import { GoogleGenAI, Type } from "@google/genai";
import { Meal, SentientOutput, UserProfile, JournalAnalysisV2, GlobalState } from "../../types";
import { UserHistory, HistoricalDataPoint, Insight } from "../../services/history/types";

// NOTE: This file is now only used for "High-Value" tasks (Image, Journal, Critical State Analysis).
// The main orchestrator loop runs in `services/sentientLocalOrchestrator.ts`.

const getAI = () => {
  // 1. Try Local Storage (User's Personal Key) - Highest Priority
  let localKey = typeof window !== 'undefined' ? localStorage.getItem("SENTIENT_API_KEY") : null;

  // 2. Fallback to Env Var (Shared/Build Key)
  const envKey = process.env.API_KEY;

  let finalKey = localKey || envKey;

  if (!finalKey) {
    console.warn("SentientAI: No API Key found.");
    return null;
  }

  // SANITIZATION: Remove whitespace which causes 404/400 errors
  finalKey = finalKey.trim();

  return new GoogleGenAI({ apiKey: finalKey });
};

// PRIMARY MODEL: Force the working 2.0 Flash Lite Preview
const FAST_MODEL = "gemini-2.0-flash-lite-preview-02-05";

// --- SYSTEM 2: THE SENIOR COACH ---
// This is called when the Local Orchestrator flags a complex or critical state.
export const generateCoachGuidance = async (
  localOutput: SentientOutput,
  profile: UserProfile
) => {
  const ai = getAI();
  if (!ai) return null;

  const context = {
    user: { name: profile.name, sport: profile.sport_type, goals: profile.goals },
    local_analysis: {
      readiness: localOutput.readinessScore,
      risks: localOutput.commanderDecision.risk_signals,
      mode: localOutput.commanderDecision.mode,
      constraints: localOutput.injuryRisks,
      plan: localOutput.timeline.adjustments
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `
                You are SentientOS (The Senior Coach).
                A local algorithm has analyzed the user's biometrics and output the following JSON state.
                
                CONTEXT: ${JSON.stringify(context)}
                
                YOUR JOB:
                1. If the user is in a "High Risk" or "Critical" state, explain WHY in human terms.
                2. Validate or refine the local algorithm's decision.
                3. Be concise, elite, and supportive. "Ghost Coach" persona.
                
                OUTPUT JSON:
                {
                    "coach_override": string (A short, punchy directive, or null if local plan is good),
                    "human_explanation": string (1-2 sentences explaining the 'Why'),
                    "motivation": string (A subtle psychological nudge)
                }
            `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coach_override: { type: Type.STRING, nullable: true },
            human_explanation: { type: Type.STRING },
            motivation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.warn("AI Coach synthesis failed", error);
    return null;
  }
};

// --- UTILITIES ---

export const testGenAIConnection = async () => {
  const ai = getAI();
  if (!ai) return { success: false, message: "No API Key found." };

  const modelsToTry = [
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.5-flash"
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`SentientAI: Testing connection with model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: "Ping. Respond with 'Pong' only.",
      });

      const text = response.text;
      if (text && text.toLowerCase().includes("pong")) {
        console.log(`SentientAI: ✅ Success with ${model}`);
        return { success: true, message: `Connected (${model})` };
      }
    } catch (error: any) {
      console.warn(`SentientAI: Failed with ${model}:`, error.message);
      if (error.status === 429) {
        return { success: false, message: "Quota Exceeded (429)." };
      }
    }
  }

  return { success: false, message: "Connection Failed." };
};

export const analyzeJournalEntry = async (text: string) => {
  const ai = getAI();
  if (!ai) return { sentiment: "Neutral", tags: ["OFFLINE"], advice: "Journal logged. (AI Offline)" };
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Analyze this user journal entry for nervous system state and psychological friction. Entry: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const analyzeJournalEntryV2 = async (text: string): Promise<JournalAnalysisV2 | null> => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Analyze this journal entry using ACT (Acceptance and Commitment Therapy) principles.
      Entry: "${text}"
      
      Return a JSON with:
      1. Sentiment (Positive/Negative/Neutral)
      2. Psychological Flexibility (0-10 scores for acceptance, defusion, values, present_moment, committed_action)
      3. Risk Signals count (catastrophizing, avoidance, rumination)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            psychological_flexibility: {
              type: Type.OBJECT,
              properties: {
                acceptance_level: { type: Type.NUMBER },
                cognitive_defusion: { type: Type.NUMBER },
                values_alignment: { type: Type.NUMBER },
                present_moment: { type: Type.NUMBER },
                committed_action: { type: Type.NUMBER }
              }
            },
            risk_signals: {
              type: Type.OBJECT,
              properties: {
                catastrophizing: { type: Type.NUMBER },
                avoidance: { type: Type.NUMBER },
                rumination: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Journal V2 failed", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: "Analyze food image. Return JSON with items (name, est_cal, macros), meal_type." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimated_cal: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      carbs: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            meal_type: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const analyzeTextMeal = async (text: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Parse this meal description into JSON items/macros: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimated_cal: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      carbs: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            meal_type: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const detectScheduleGroups = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  if (!ai) return { hasMultipleGroups: false, groups: ["Default"] };
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: "Scan schedule. List distinct training groups." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasMultipleGroups: { type: Type.BOOLEAN },
            groups: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { hasMultipleGroups: false, groups: ["Default"] };
  }
};

export const extractSessionsForContext = async (base64Data: string, mimeType: string, group: string, day: string) => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          {
            text: `You are a training schedule analyzer. Extract all training sessions for group '${group}' on '${day}' from this image/PDF.

For each session, extract:
- type: "sport" for training, "recovery" for rest/mobility, "fuel" for meals/nutrition
- title: Short name of the session (e.g. "Morning Strength", "Track Session")
- description: Brief details of what the session involves
- time_of_day: In 24h format like "09:00" or "14:30"
- duration_minutes: Estimated duration in minutes (e.g. 60, 90, 120)
- intensity: "low", "medium", "high", or "max"
- sequence_block: "morning", "noon", "afternoon", or "evening"
- coach_planned: true if this appears to be coach-prescribed
- notes: Any special instructions or notes

Return an array of session objects. If no sessions found, return empty array [].` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              time_of_day: { type: Type.STRING },
              duration_minutes: { type: Type.NUMBER },
              intensity: { type: Type.STRING },
              sequence_block: { type: Type.STRING },
              coach_planned: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return [];
  }
};

// --- NEW V2 AI FEATURES ---

/**
 * ASK SENTIENT COACH
 * Conversational Q&A with full context awareness
 */
export const askSentientCoach = async (
  question: string,
  state: GlobalState,
  history?: UserHistory
): Promise<{ response: string; suggestions: string[] } | null> => {
  const ai = getAI();
  if (!ai) return { response: "AI is offline. Please check your API key.", suggestions: [] };

  // Build context summary
  const recentData = history?.dataPoints.slice(-7) || [];
  const avgReadiness = recentData.length > 0
    ? Math.round(recentData.reduce((s, d) => s + d.readiness, 0) / recentData.length)
    : state.mindspace.readiness_score;

  const context = {
    current_state: {
      readiness: state.mindspace.readiness_score,
      stress: state.mindspace.stress,
      mood: state.mindspace.mood,
      fuel_score: state.fuel.fuel_score,
      hrv: state.sleep.hrv,
      sleep_debt: state.sleep.sleep_debt,
      recovery_score: state.recovery.recovery_score,
      acwr: state.physical_load.acwr
    },
    profile: {
      sport: state.user_profile.sport_type,
      goals: state.user_profile.goals,
      training_level: state.user_profile.training_level
    },
    trends: {
      avg_readiness_7d: avgReadiness,
      data_points_count: recentData.length
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `
        You are SentientOS, an elite performance coach AI. The user is asking you a question.
        
        USER CONTEXT: ${JSON.stringify(context)}
        
        USER QUESTION: "${question}"
        
        GUIDELINES:
        - Be concise but helpful (2-4 sentences max)
        - Reference their actual data when relevant
        - Be supportive but direct
        - Suggest actionable next steps
        
        OUTPUT JSON with:
        - response: Your answer to their question
        - suggestions: Array of 1-2 follow-up questions they might ask
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Coach failed:", error);
    return { response: "I'm having trouble connecting right now. Try again in a moment.", suggestions: [] };
  }
};

/**
 * GENERATE WEEKLY INSIGHTS
 * AI-powered pattern analysis for weekly summary
 */
export const generateWeeklyInsights = async (
  history: UserHistory,
  profile: UserProfile
): Promise<{ summary: string; patterns: string[]; recommendations: string[] } | null> => {
  const ai = getAI();
  if (!ai) return null;

  const lastWeek = history.dataPoints.filter(
    dp => dp.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  if (lastWeek.length < 3) {
    return {
      summary: "Not enough data for weekly analysis. Keep logging!",
      patterns: [],
      recommendations: ["Log daily for personalized insights"]
    };
  }

  // Calculate aggregates
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const stats = {
    avg_readiness: Math.round(avg(lastWeek.map(d => d.readiness))),
    avg_fuel: Math.round(avg(lastWeek.map(d => d.fuel_score))),
    avg_sleep: Math.round(avg(lastWeek.map(d => d.sleep_duration)) * 10) / 10,
    avg_stress: Math.round(avg(lastWeek.map(d => d.stress)) * 10) / 10,
    min_readiness: Math.min(...lastWeek.map(d => d.readiness)),
    max_readiness: Math.max(...lastWeek.map(d => d.readiness)),
    data_points: lastWeek.length
  };

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `
        Analyze this athlete's weekly performance data.
        
        PROFILE: ${profile.sport_type}, ${profile.training_level}, Goals: ${profile.goals.join(', ')}
        
        WEEKLY STATS: ${JSON.stringify(stats)}
        
        Generate:
        1. A 2-sentence summary of their week
        2. 2-3 patterns you notice
        3. 2-3 actionable recommendations for next week
        
        Be specific to their data, not generic. Be encouraging but data-driven.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Weekly insights failed:", error);
    return null;
  }
};

/**
 * PREDICT PERFORMANCE TREND
 * AI-enhanced trajectory forecasting
 */
export const predictPerformanceTrend = async (
  history: UserHistory,
  profile: UserProfile
): Promise<{ prediction: string; confidence: string; factors: string[] } | null> => {
  const ai = getAI();
  if (!ai) return null;

  const last14 = history.dataPoints.slice(-14);
  if (last14.length < 7) return null;

  const trajectory = last14.map(d => ({
    date: d.date,
    readiness: d.readiness,
    fuel: d.fuel_score,
    recovery: d.recovery_score
  }));

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `
        Based on this 2-week trajectory, predict next week's performance trend.
        
        DATA: ${JSON.stringify(trajectory)}
        SPORT: ${profile.sport_type}
        
        Provide:
        - prediction: One sentence about expected trajectory
        - confidence: "high", "medium", or "low"
        - factors: Key factors influencing prediction (2-3)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            confidence: { type: Type.STRING },
            factors: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Performance prediction failed:", error);
    return null;
  }
};

/**
 * ANALYZE MOOD TRAJECTORY
 * Sentiment analysis over time
 */
export const analyzeMoodTrajectory = async (
  history: UserHistory
): Promise<{ trend: string; insight: string; concernLevel: number } | null> => {
  const ai = getAI();
  if (!ai) return null;

  const last14 = history.dataPoints.slice(-14);
  if (last14.length < 5) return null;

  const moodData = last14.map(d => ({
    date: d.date,
    mood: d.mood,
    stress: d.stress
  }));

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `
        Analyze this 2-week mood and stress trajectory.
        
        DATA: ${JSON.stringify(moodData)}
        
        Provide:
        - trend: "improving", "declining", or "stable"
        - insight: One sentence about mental state pattern
        - concernLevel: 0 (fine) to 10 (concerning)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING },
            insight: { type: Type.STRING },
            concernLevel: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Mood trajectory failed:", error);
    return null;
  }
};

// ========================================================================
// SMART SCALE REPORT ANALYZER
// Extracts body composition data from smart scale report images/screenshots
// ========================================================================

export const analyzeScaleReport = async (
  base64Image: string,
  mimeType: string
): Promise<{
  weight_kg?: number;
  body_fat_percent?: number;
  muscle_mass_kg?: number;
  bone_mass_kg?: number;
  body_water_percent?: number;
  visceral_fat_level?: number;
  bmr?: number;
  metabolic_age?: number;
  confidence: 'high' | 'medium' | 'low';
  detected_scale_brand?: string;
} | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          {
            text: `You are analyzing a smart scale report or body composition analysis screenshot.

Extract ALL available body metrics from this image. Common smart scale brands include:
Withings, Renpho, Eufy, Xiaomi Mi Scale, Garmin Index, Tanita, Omron, etc.

For each metric found, extract the numeric value. If a unit conversion is needed, convert to:
- Weight: kg (if shown in lbs, divide by 2.205)
- Body fat: percentage
- Muscle mass: kg
- BMR: kcal/day

OUTPUT JSON with these fields (use null if not found):
- weight_kg: number or null
- body_fat_percent: number or null
- muscle_mass_kg: number or null
- bone_mass_kg: number or null
- body_water_percent: number or null
- visceral_fat_level: number or null (usually 1-59 scale)
- bmr: number or null (kcal per day)
- metabolic_age: number or null
- confidence: "high", "medium", or "low" based on image clarity
- detected_scale_brand: string or null (if you can identify the app/scale)

Be precise with numbers. If you see "23.5%", return 23.5, not 24.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weight_kg: { type: Type.NUMBER, nullable: true },
            body_fat_percent: { type: Type.NUMBER, nullable: true },
            muscle_mass_kg: { type: Type.NUMBER, nullable: true },
            bone_mass_kg: { type: Type.NUMBER, nullable: true },
            body_water_percent: { type: Type.NUMBER, nullable: true },
            visceral_fat_level: { type: Type.NUMBER, nullable: true },
            bmr: { type: Type.NUMBER, nullable: true },
            metabolic_age: { type: Type.NUMBER, nullable: true },
            confidence: { type: Type.STRING },
            detected_scale_brand: { type: Type.STRING, nullable: true }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Scale report analysis failed:", error);
    return null;
  }
};
