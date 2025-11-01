const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Client {
  user_id: number;
  name: string;
  email: string;
  role_name: string;
  weight_goal: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  allergies: string;
  budget: string;
  location: string;
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
