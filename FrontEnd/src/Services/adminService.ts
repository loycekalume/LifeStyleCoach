// src/Services/adminService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserEngagement = async () => {
  const res = await axios.get(`${API_URL}/admin/engagement`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};


export const getOverview = async (token: string) => {
  const res = await axios.get(`${API_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllUsers = async (token: string) => {
  const res = await axios.get(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export const getInstructors = async (token: string) => {
  const res = await axios.get(`${API_URL}/users/instructors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getDieticians = async (token: string) => {
  const res = await axios.get(`${API_URL}/users/dieticians`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getClients = async (token: string) => {
  const res = await axios.get(`${API_URL}/users/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const toggleUserStatus = async (token: string, userId: number) => {
  const res = await axios.patch(`${API_URL}/users/${userId}/toggle-active`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};