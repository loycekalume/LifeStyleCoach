import { useState, useEffect } from "react";
import {
  FaHome,
  FaDumbbell,
  FaUtensils,
  FaUsers,
  FaCalendar,
  FaChartLine,
  FaChevronDown,
  FaUser,
  FaBell,
  FaCreditCard,
  FaSignOutAlt,
  FaHeart,
} from "react-icons/fa";
import "./TopNav.css";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  period: "morning" | "afternoon" | "night";
}

interface TopNavProps {
  currentPage:
    | "dashboard"
    | "workouts"
    | "nutrition"
    | "instructors"
    | "schedule"
    | "progress";
  onNavigate?: (
    page:
      | "dashboard"
      | "workouts"
      | "nutrition"
      | "instructors"
      | "schedule"
      | "progress"
  ) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Get username
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  // Fetch notifications (poll every minute)
  useEffect(() => {
    let interval: number;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    interval = window.setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <div className="logo">
            <FaHeart />
            <span>LifeStyle Coach</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-menu">
          <a
            href="#"
            className={`nav-link ${
              currentPage === "dashboard" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("dashboard");
            }}
          >
            <FaHome />
            <span>Dashboard</span>
          </a>

          <a
            href="#"
            className={`nav-link ${
              currentPage === "workouts" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("workouts");
            }}
          >
            <FaDumbbell />
            <span>Workouts</span>
          </a>

          <a
            href="#"
            className={`nav-link ${
              currentPage === "nutrition" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("nutrition");
            }}
          >
            <FaUtensils />
            <span>Nutrition</span>
          </a>

          <a
            href="#"
            className={`nav-link ${
              currentPage === "instructors" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("instructors");
            }}
          >
            <FaUsers />
            <span>Instructors</span>
          </a>

          <a
            href="#"
            className={`nav-link ${
              currentPage === "schedule" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("schedule");
            }}
          >
            <FaCalendar />
            <span>Schedule</span>
          </a>

          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("progress");
            }}
          >
            <FaChartLine />
            <span>Progress</span>
          </a>
        </div>

        {/* Profile + Notifications */}
        <div className="nav-profile">
          <div className="profile-dropdown">
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                alt="Profile"
              />
              <span>{userName}</span>
              <FaChevronDown />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <FaUser /> Profile Settings
                </div>

                {/* Notifications */}
                <div
                  className="dropdown-item notifications-toggle"
                  onClick={() =>
                    setNotificationsOpen(!notificationsOpen)
                  }
                >
                  <FaBell />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                  )}
                </div>

                {notificationsOpen && (
                  <div
                    className="notifications-list"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notifications.length === 0 ? (
                      <p className="empty">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${
                            n.is_read ? "read" : "unread"
                          }`}
                          onClick={() =>
                            !n.is_read && markAsRead(n.id)
                          }
                        >
                          <p>
                            {n.period === "morning"
                              ? "🌅"
                              : n.period === "afternoon"
                              ? "☀️"
                              : "🌙"}{" "}
                            {n.message}
                          </p>
                          <small>
                            {new Date(
                              n.created_at
                            ).toLocaleString()}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="dropdown-item">
                  <FaCreditCard /> Billing
                </div>

                <div className="dropdown-divider" />

                <button
                  onClick={handleLogout}
                  className="dropdown-item logout"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
