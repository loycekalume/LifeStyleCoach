// src/api/notifications.api.ts
import axios from "axios";
import type{ Notification } from "../types/notification";

const API_URL = import.meta.env.VITE_API_URL;

export const getNotifications = async () => {
  const res = await axios.get<Notification[]>(
    `${API_URL}/notifications`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
};

export const markNotificationAsRead = async (id: number) => {
  await axios.patch(
    `${API_URL}/notifications/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};
