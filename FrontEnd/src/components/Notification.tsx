// src/components/Notifications.tsx
import { useEffect, useState } from "react";
import type{ Notification } from "../types/notification";
import {
  getNotifications,
  markNotificationAsRead,
} from "../Services/notificationService";

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="notifications">
      <h3>🔔 Notifications</h3>

      {notifications.length === 0 && (
        <p>No notifications yet</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification ${n.is_read ? "read" : "unread"}`}
        >
          <p>{n.message}</p>
          <small>
            {n.period} · {new Date(n.created_at).toLocaleString()}
          </small>

          {!n.is_read && (
            <button onClick={() => handleMarkAsRead(n.id)}>
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
