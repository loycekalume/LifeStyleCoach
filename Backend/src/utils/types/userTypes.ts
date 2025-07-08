import { Request } from "express";

export interface User {
  user_id: number;
  name: string;
  email: string;
  password_hash?: string;
  weight_goal: 'gain' | 'maintain' | 'lose';
  age: number;
  gender: string;
  weight: number;
  height: number;
  health_conditions: string[];
  allergies: string[];
  budget: 'Low' | 'medium' | 'high';
  location: string;
  role: 'user' | 'instructor' | 'admin';
  created_at: string;
}

export interface UserRequest extends Request {
  user?: User;
}
