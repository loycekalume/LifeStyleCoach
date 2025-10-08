import type { ClientProfileInput } from "../pages/Client"; 



const API_BASE = "http://localhost:3000/client";

// Get all clients
export const getClients = async (): Promise<ClientProfileInput[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error("Failed to fetch clients");
  return response.json();
};

// Get a single client by ID
export const getClientById = async (id: number): Promise<ClientProfileInput> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) throw new Error("Failed to fetch client");
  return response.json();
};

export const createClient = async (client: ClientProfileInput): Promise<ClientProfileInput> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error("Failed to create client");
  return response.json();
};

// Delete a client
export const deleteClient = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete client");
};


//