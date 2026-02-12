
const API_URL = "https://lifestylecoach.onrender.com/mealLogs";

export type MealLog = {
  log_id: number;
  user_id: number;
  meal_time:string;
  calories: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

// GET all meal logs
export async function getMealLogs(): Promise<MealLog[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch meal logs");
  return response.json();
}

// GET a single meal log by id
export async function getMealLog(id: number): Promise<MealLog> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch meal log");
  return response.json();
}

// CREATE a new meal log
export async function createMealLog(data: Omit<MealLog, "meal_id" | "created_at" | "updated_at">): Promise<MealLog> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create meal log");
  return response.json();
}

// UPDATE an existing meal log
export async function updateMealLog(id: number, data: Partial<MealLog>): Promise<MealLog> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update meal log");
  return response.json();
}

// DELETE a meal log
export async function deleteMealLog(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete meal log");
}
