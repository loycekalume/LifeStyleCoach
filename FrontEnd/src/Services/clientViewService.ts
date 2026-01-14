const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  match_score?: number;   // New field
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


// ✅ Fetch all clients
export const getClients = async (): Promise<Client[]> => {
  const res = await fetch(`${API_URL}/client`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  const data = await res.json();
  return data.clients || [];
};

// ✅ Get a single client by ID
export const getClientById = async (id: number): Promise<Client> => {
  const res = await fetch(`${API_URL}/client/${id}`);
  if (!res.ok) throw new Error("Failed to fetch client");
  return await res.json();
};

// ✅ Create or update a client (upsert)
export const saveClient = async (clientData: Partial<Client>): Promise<Client> => {
  const res = await fetch(`${API_URL}/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error("Failed to save client");
  const data = await res.json();
  return data.client;
};



//Progress Logs
// ✅ Fetch logs for one user using user_id
export const getProgressLogsByUserId = async (user_id: number): Promise<ProgressLog[]> => {
  const res = await fetch(`${API_URL}/progress/users/${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch progress logs");
  const data = await res.json();
  return data.logs || []; // expect: { message, logs: [...] }
};

// ✅ Add a log for a user
export const addProgressLog = async (log: Partial<ProgressLog>): Promise<ProgressLog> => {
  const res = await fetch(`${API_URL}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("Failed to save progress log");
  const data = await res.json();
  return data.log;
};

//Workout plans
// Fetch ALL workouts
export async function getAllWorkouts(): Promise<Workout[]> {
  const res = await fetch(`${API_URL}/workout`);
  if (!res.ok) throw new Error("Failed to fetch workouts");
  return res.json();
}

// Fetch workout by ID
export async function getWorkoutById(id: number | string): Promise<Workout> {
  const res = await fetch(`${API_URL}/workout/${id}`);
  if (!res.ok) throw new Error("Workout not found");
  return res.json();
}

// Update workout
export async function updateWorkout(id: number | string, payload: Partial<Workout>): Promise<Workout> {
  const res = await fetch(`${API_URL}/workout/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to update workout");
  return res.json();
}