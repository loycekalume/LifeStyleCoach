import axiosInstance from "../utils/axiosInstance"; // ✅ Import your configured instance

// Note: No need to manually get the token or pass it as an argument anymore.
// axiosInstance handles credentials (cookies/headers) automatically.

export const getUserEngagement = async () => {
  const res = await axiosInstance.get("/admin/engagement");
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await axiosInstance.get("/admin/stats");
  return res.data;
};

export const getOverview = async () => {
  const res = await axiosInstance.get("/admin/overview");
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/admin/users");
  return res.data;
};

export const getInstructors = async () => {
  const res = await axiosInstance.get("/users/instructors");
  return res.data;
};

export const getDieticians = async () => {
  const res = await axiosInstance.get("/users/dieticians");
  return res.data;
};

export const getClients = async () => {
  const res = await axiosInstance.get("/users/clients");
  return res.data;
};

export const toggleUserStatus = async (userId: number) => {
  const res = await axiosInstance.patch(`/users/${userId}/toggle-active`);
  return res.data;
};

export const deleteUser = async (userId: number) => {
  const res = await axiosInstance.delete(`/users/${userId}`);
  return res.data;
};