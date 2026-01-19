import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import ProfileCard from "../components/instructor/profileCard";
import ContactCard from "../components/instructor/contactCard";
import Specializations from "../components/instructor/specializationCard";
import PricingCard from "../components/instructor/pricingCard";
import MonthlyStats from "../components/instructor/assignedWorkouts";
import UpcomingSessions from "../components/instructor/sessionsCard";
import Reviews from "../components/instructor/reviewCard";
import "../styles/instructor.css";
import Overview from "../components/instructor/overview";

// ❌ Removed WorkoutsModal import (moved to AllWorkoutsPage)

const InstructorProfile: React.FC = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedInstructorId = localStorage.getItem("instructorId");
    if (storedInstructorId) {
      setInstructorId(parseInt(storedInstructorId, 10));
    }
  }, []);

  if (instructorId === null) {
    return (
      <div className="loading-container">
        <h1>Loading Profile...</h1>
        <p>Authenticating instructor details.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile </h1>
            <div className="header-actions">
              
              {/* ✅ CHANGED: Navigates to All Workouts Page */}
              <button
                className="btn btn-outline"
                onClick={() => navigate("/workouts")} // Ensure this matches your route path
              >
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
          <aside className="profile-sidebar">
            <ProfileCard />
            <ContactCard instructorId={instructorId} />
            <Specializations />
            <PricingCard />
          </aside>
          <main className="profile-main">
            <Overview />
            <MonthlyStats />
            <UpcomingSessions />
            <Reviews />
          </main>
        </div>
      </div>

      {/* ❌ Removed WorkoutsModal from here */}
    </div>
  );
};

export default InstructorProfile;