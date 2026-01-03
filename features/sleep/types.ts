
// =====================================================
// SLEEP DOMAIN TYPES
// =====================================================

export interface SleepHygieneStack {
  timing_protocols: Array<{ name: string; time_before_bed: number; mechanism: string; }>;
  supplements: Array<{ name: string; dose: string; timing: string; }>;
  environment: { temperature_celsius: number; darkness_lux: number; };
}

export interface SleepState {
  duration: number; // hours
  efficiency: number; // percentage 0-100
  disturbances: number; // count
  sleep_debt: number; // hours accumulated vs baseline
  hrv: number; // ms
  resting_hr: number; // bpm
  bedtime: string; // ISO timestamp or HH:MM
  wake_time: string; // ISO timestamp or HH:MM
  sleep_quality_score: number; // 0-100 
  duration_hours?: number; // Alias for duration
  quality?: number; // 1-10 scale
  body_temperature?: number; // Celsius - from wearable, important for illness detection & circadian
}