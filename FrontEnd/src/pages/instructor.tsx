import React, { useState, useEffect } from "react";
import ProfileCard from "../components/instructor/profileCard";
import ContactCard from "../components/instructor/contactCard";
import Specializations from "../components/instructor/specializationCard";
import PricingCard from "../components/instructor/pricingCard";
import MonthlyStats from "../components/instructor/workoutCard";
import UpcomingSessions from "../components/instructor/sessionsCard";
import Reviews from "../components/instructor/reviewCard";
import "../styles/instructor.css";
import Overview from "../components/instructor/overview";
import WorkoutsModal from "../components/instructor/workOutModal";

const InstructorProfile: React.FC = () => {
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  // ✅ FIX: Read the dedicated instructorId from localStorage
  useEffect(() => {
    const storedInstructorId = localStorage.getItem("instructorId"); 
    if (storedInstructorId) {
      setInstructorId(parseInt(storedInstructorId, 10));
    }
    // If the instructorId is missing, but a generic userId exists,
    // it implies the profile hasn't been created yet, which should
    // be handled by a middleware/router redirecting to /complete-profile.
  }, []);

  // Show a loading state or nothing until the ID is retrieved/set
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
              <button
                className="btn btn-outline"
                onClick={() => setIsWorkoutsOpen(true)}
              >
                <i className="fas fa-dumbbell"></i>Add Workouts
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-edit"></i> View Clients
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <ProfileCard />
             {/* All cards now receive the distinct instructorId */}
            <ContactCard instructorId={instructorId} /> 
            <Specializations /> 
            <PricingCard  />
          </aside>
          <main className="profile-main">
            <Overview />
            <MonthlyStats />
            <UpcomingSessions />
            <Reviews />
          </main>
        </div>
      </div>

      {/* Workouts Modal */}
      <WorkoutsModal
        isOpen={isWorkoutsOpen}
        onClose={() => setIsWorkoutsOpen(false)}
        instructorId={instructorId}
      />
    </div>
  );
};

export default InstructorProfile;
