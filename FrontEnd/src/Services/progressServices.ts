const API_URL = "http://localhost:3000/progress";

export type ProgressLog = {
  id: number;
  user_id: number;
  date: string; // YYYY-MM-DD
  weight?: number;
  workout_done?: boolean;
  meals_logged?: boolean;
  current_streak?: number;
};

// GET all progress logs
export async function getProgressLogs(): Promise<ProgressLog[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch progress logs");
  return response.json();
}

// GET a single progress log by id
export async function getProgressLog(id: number): Promise<ProgressLog> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch progress log");
  return response.json();
}

// CREATE a new progress log
export async function createProgressLog(
  data: Omit<ProgressLog, "id">
): Promise<ProgressLog> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create progress log");
  return response.json();
}

export async function getProgressLogsByUser(userId: number): Promise<ProgressLog[]> {
  const response = await fetch(`${API_URL}/users/${userId}`);
  
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404 || data.message === "Logs not Found") {
      return [];
    }
    throw new Error(`Failed to fetch user logs: ${JSON.stringify(data)}`);
  }

  return data.log; // ✅ only return the logs array
}


// UPDATE a progress log
export async function updateProgressLog(
  id: number,
  data: Partial<ProgressLog>
): Promise<ProgressLog> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update progress log");
  return response.json();
}

// DELETE a progress log
export async function deleteProgressLog(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete progress log");
}
