 import {Request } from "express"
export interface User {
  user_id: string;
  name?: string;
  email: string;
  password_hash?: string;
  weight_goal?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  health_conditions?: string[];
  allergies?: string[];
  budget?: 'Low' | 'medium' | 'high';
  location?: string;
  role?: 'user' | 'instructor' | 'admin';
  created_at?: Date;
}

//Custom Express Request Type to include 'user object
export interface UserRequest extends Request{
    user?:User;
}