import  { useState, useEffect } from "react";
import Logo from "./logo";
import ProfileDropdown from "./profileDropdown";
import { useModal } from "./../../../contexts/modalContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance"; 
import io from "socket.io-client";

// Ensure this matches your backend URL
const SOCKET_URL = "http://localhost:3000"; 

export default function Header() {
  const { openConsultationModal } = useModal();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // 1. Get User ID from storage (Required for Socket Room)
    const storedUserId = localStorage.getItem("userId");
    
    // 2. Initial Fetch of Unread Count
    fetchUnreadCount();

    // 3. Real-time Socket Connection
    if (storedUserId) {
        const socket = io(SOCKET_URL);
        
        // Join my personal notification room
        socket.emit("join_user_room", parseInt(storedUserId, 10));

        // Listen for new message alerts
        socket.on("new_message_notification", () => {
             // Increment badge instantly
             setUnreadCount(prev => prev + 1);
        });

        return () => { socket.disconnect(); };
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get("/messages/conversations");
      // Calculate total unread messages
      const totalUnread = res.data.reduce((sum: number, conv: any) => {
          return sum + Number(conv.unread_count || 0);
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread count", error);
    }
  };

  return (
    <header className="header1">
      <div className="container">
        <div className="header1-content">

          <div className="header1-left">
            <Logo />
            <h1>Dietician Dashboard</h1>
          </div>

          <div className="header1-actions">
            
            
            <button
              className="btn btn-outline1"
              onClick={() => navigate('/messages')} 
              style={{ position: 'relative' }} 
            >
              <i className="fas fa-comments"></i> My Chats

              {/* 🔴 RED BADGE */}
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <button
              className="btn btn-outline1"
              onClick={openConsultationModal}
            >
              <i className="fas fa-calendar-plus"></i> Schedule Consultation
            </button>

            <ProfileDropdown />
          </div>

        </div>
      </div>
    </header>
  );
}