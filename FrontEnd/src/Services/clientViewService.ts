import axiosInstance from "../utils/axiosInstance";

export interface Client {
  user_id: number;
  name: string;
  email: string;
  role_name?: string;
  weight_goal: string;
  age: number;
  gender: string;
  weight?: number;
  height?: number;
  allergies?: string;
  budget: string;
  location: string;
  match_score?: number;   
  match_reasons?: string[];
}

export interface ProgressLog {
  id: number;
  user_id: number;
  date: string;
  weight: number;
  workout_done: boolean;
  meals_logged: boolean;
  current_streak: number;
}

export interface Workout {
  workout_id: number;
  instructor_id: number;
  title: string;
  description: string;
  plan: any;
}

// --- Client API Calls ---

// ✅ Fetch all clients
export const getClients = async (): Promise<Client[]> => {
  const res = await axiosInstance.get('/client');
  return res.data.clients || [];
};

// ✅ Get a single client by ID
export const getClientById = async (id: number): Promise<Client> => {
  const res = await axiosInstance.get(`/client/${id}`);
  return res.data;
};

// ✅ Create or update a client (upsert)
export const saveClient = async (clientData: Partial<Client>): Promise<Client> => {
  const res = await axiosInstance.post('/client', clientData);
  return res.data.client;
};

// --- Progress Logs API Calls ---

// ✅ Fetch logs for one user using user_id
export const getProgressLogsByUserId = async (user_id: number): Promise<ProgressLog[]> => {
  // Check if endpoint is /progress/users/:id or /progress/:id based on your backend
  const res = await axiosInstance.get(`/progress/${user_id}`);
  
  // Handle both possible response structures (array root or object with logs key)
  if (Array.isArray(res.data)) return res.data;
  return res.data.logs || []; 
};

// ✅ Add a log for a user
export const addProgressLog = async (log: Partial<ProgressLog>): Promise<ProgressLog> => {
  const res = await axiosInstance.post('/progress', log);
  return res.data.log;
};

// --- Workout Plans API Calls ---

// ✅ Fetch ALL workouts
export async function getAllWorkouts(): Promise<Workout[]> {
  const res = await axiosInstance.get('/workout');
  return res.data;
}

// ✅ Fetch workout by ID
export async function getWorkoutById(id: number | string): Promise<Workout> {
  const res = await axiosInstance.get(`/workout/${id}`);
  return res.data;
}

// ✅ Update workout
export async function updateWorkout(id: number | string, payload: Partial<Workout>): Promise<Workout> {
  const res = await axiosInstance.put(`/workout/${id}`, payload);
  return res.data;
}