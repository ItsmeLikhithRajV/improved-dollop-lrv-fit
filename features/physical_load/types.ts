
// =====================================================
// PHYSICAL LOAD DOMAIN TYPES
// =====================================================

export type TrendDirection = 'up' | 'down' | 'stable';

export interface PhysicalLoadState {
  acwr: number; 
  acute_load: number; 
  chronic_load: number; 
  monotony: number; 
  strain: number; 
  weekly_volume: number; 
  load_history: number[]; 
  metrics: {
    label: string;
    value: string;
    trend: TrendDirection;
    ideal: string;
  }[];
}
