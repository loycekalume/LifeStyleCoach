// src/services/dieticianService.ts

const API_URL = "http://localhost:3000/dietician";

export interface Dietician {
  dietician_id?: number;
  user_id: number;
  certification: string;
  specialization?: string;
  years_of_experience?: number;
  clinic_name?: string;
  clinic_address?: string;
  created_at?: string;
  updated_at?: string;
}

// ✅ Fetch all dieticians
export const getDieticians = async (): Promise<Dietician[]> => {
  console.log("📡 Fetching dieticians from:", API_URL);

  const res = await fetch(API_URL);

  if (!res.ok) {
    console.error("❌ Failed to fetch dieticians:", res.statusText);
    throw new Error("Failed to fetch dieticians");
  }

  const data = await res.json();
  console.log("✅ Raw API response:", data);

  // ✅ Make sure we return an array (the dietician list)
  return Array.isArray(data.dietician) ? data.dietician : [];
};


// ✅ Fetch a single dietician by ID
export const getDieticianById = async (id: number): Promise<Dietician> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch dietician");
  return res.json();
};

// ✅ Create a new dietician
export const createDietician = async (dietician: Dietician): Promise<Dietician> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dietician),
  });
  if (!res.ok) throw new Error("Failed to create dietician");
  return res.json();
};

// ✅ Update dietician by ID
export const updateDietician = async (
  id: number,
  dietician: Partial<Dietician>
): Promise<Dietician> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dietician),
  });
  if (!res.ok) throw new Error("Failed to update dietician");
  return res.json();
};

// ✅ Delete dietician by ID
export const deleteDietician = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete dietician");
  return res.json();
};
