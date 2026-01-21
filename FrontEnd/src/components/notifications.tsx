import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications every 60 seconds (optional, or just load once)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/clientWorkouts/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
      console.error("Error loading notifications");
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await axiosInstance.put(`/clientWorkouts/notifications/${id}/read`);
      // Optimistic Update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 🔔 The Bell Icon */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', 
            width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}
      >
        🔔
        {unreadCount > 0 && (
            <span style={{
                position: 'absolute', top: -5, right: -5, 
                background: '#ef4444', color: 'white', 
                fontSize: '0.7rem', fontWeight: 'bold',
                borderRadius: '50%', width: '20px', height: '20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white'
            }}>
                {unreadCount}
            </span>
        )}
      </button>

      {/* 🔽 The Dropdown */}
      {showDropdown && (
        <div style={{
            position: 'absolute', right: 0, top: '50px', 
            width: '320px', background: 'white', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
            borderRadius: '8px', zIndex: 1000,
            border: '1px solid #e5e7eb', overflow: 'hidden'
        }}>
            <div style={{ padding: '10px 15px', background: '#f9fafb', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#374151' }}>
                Notifications
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                        No new notifications.
                    </p>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} 
                             onClick={() => handleMarkRead(n.id)}
                             style={{
                                padding: '12px 15px', 
                                borderBottom: '1px solid #f3f4f6', 
                                background: n.is_read ? 'white' : '#eff6ff', 
                                cursor: 'pointer'
                             }}
                        >
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#1f2937' }}>
                                {n.message}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {new Date(n.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;