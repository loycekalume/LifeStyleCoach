// src/types.ts

export interface PlanItem {
  exercise: string;
  sets?: number;
  reps?: number;
  duration?: number | string;
}

export interface Workout {
  workout_id: number;
  title: string;
  description: string;
  plan: PlanItem[];
  created_at?: string; 
}
