import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

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

const InstructorProfile: React.FC = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedInstructorId = localStorage.getItem("instructorId");
    if (storedInstructorId) {
      setInstructorId(parseInt(storedInstructorId, 10));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("instructorId");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (instructorId === null) {
    return (
      <div className="loading-container">
        <h1>Loading Profile...</h1>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile</h1>
            <div className="header-actions">
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
            
            {/* Top Section */}
            <div>
              <ProfileCard />
              <ContactCard instructorId={instructorId} />
              <Specializations />
              <PricingCard />
            </div>

            {/* ✅ LOGOUT: Pushed to bottom using margin-top: auto */}
            <div className="logout-container" style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button 
                onClick={handleLogout}
                className="btn-logout"
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#fee2e2', 
                    color: '#991b1b',           
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#ef4444'; // Red-500
                    e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.color = '#991b1b';
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>

          </aside>

          {/* MAIN CONTENT */}
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