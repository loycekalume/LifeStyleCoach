import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import io from "socket.io-client"; // ✅ Import Socket

// Components
import ProfileCard from "../components/instructor/profileCard";
import ContactCard from "../components/instructor/contactCard";
import Specializations from "../components/instructor/specializationCard";
import PricingCard from "../components/instructor/pricingCard";
import MonthlyStats from "../components/instructor/assignedWorkouts";
import UpcomingSessions from "../components/instructor/sessionsCard";
import Reviews from "../components/instructor/reviewCard";
import Overview from "../components/instructor/overview";

import "../styles/instructor.css";

const SOCKET_URL = "http://localhost:3000"; // Update if hosted elsewhere

const InstructorProfile: React.FC = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [, setUserId] = useState<number | null>(null); 
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get IDs from storage
    const storedInstructorId = localStorage.getItem("instructorId");
    const storedUserId = localStorage.getItem("userId"); // Ensure you store this on login!

    if (storedInstructorId) setInstructorId(parseInt(storedInstructorId, 10));
    if (storedUserId) setUserId(parseInt(storedUserId, 10));

    // 2. Initial Fetch
    fetchUnreadCount();

    // 3.  Real-time Socket Connection
    if (storedUserId) {
        const socket = io(SOCKET_URL);
        
        // Join my personal notification room
        socket.emit("join_user_room", parseInt(storedUserId, 10));

        // Listen for new message alerts
        socket.on("new_message_notification", () => {
            // Option A: Just increment (Fastest)
            setUnreadCount(prev => prev + 1);
            
            // Option B: Re-fetch from server (Most Accurate)
            // fetchUnreadCount(); 
            
            // Optional: Play a sound here
        });

        return () => { socket.disconnect(); };
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get("/messages/conversations");
      
      // ✅ FIX: Force Number conversion to avoid "0" + "1" = "01" string issues
      const totalUnread = res.data.reduce((sum: number, conv: any) => {
          return sum + Number(conv.unread_count || 0);
      }, 0);

      console.log("Calculated Unread Count:", totalUnread); // Debug log
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread count", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.clear(); // Clears all IDs/Tokens
      navigate("/login");
    }
  };

  if (instructorId === null) {
    return <div className="loading-container"><h1>Loading Profile...</h1></div>;
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile</h1>
            <div className="header-actions">
              
              {/* My Chats Button with Badge */}
              <button 
                className="btn btn-outline" 
                onClick={() => navigate("/messages")}
                style={{ position: 'relative' }} 
              >
                <i className="fas fa-comments"></i> My Chats
                
                {/* Badge Logic */}
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <button className="btn btn-outline" onClick={() => navigate("/workouts")}>
                <i className="fas fa-dumbbell"></i> Workouts
              </button>

              <Link to="/clientsView" className="btn btn-primary">
                <i className="fas fa-user-friends"></i> View Clients
              </Link>

            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <ProfileCard />
              <ContactCard instructorId={instructorId} />
              <Specializations />
              <PricingCard />
            </div>

            <div className="logout-container" style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button 
                onClick={handleLogout}
                className="btn-logout"
                style={{
                    width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b',
                    border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontWeight: '600', transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </aside>

          <main className="profile-main">
            <Overview />
            <MonthlyStats />
            <UpcomingSessions />
            <Reviews />
          </main>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;