import React, { useState } from "react";
import ProfileCard from "../components/instructor/profileCard";
import ContactCard from "../components/instructor/contactCard";
import Specializations from "../components/instructor/specializationCard";
import PricingCard from "../components/instructor/pricingCard";
import MonthlyStats from "../components/instructor/workoutCard";
import UpcomingSessions from "../components/instructor/sessionsCard";
import Reviews from "../components/instructor/reviewCard";
import "../css/instructor.css";
import Overview from "../components/instructor/overview";
import WorkoutsModal from "../components/instructor/workOutModal";

const InstructorProfile: React.FC = () => {
  const [isWorkoutsOpen, setIsWorkoutsOpen] = useState(false);

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile</h1>
            <div className="header-actions">
              <button
                className="btn btn-outline"
                onClick={() => setIsWorkoutsOpen(true)}
              >
                <i className="fas fa-dumbbell"></i>Add Workouts
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <ProfileCard />
            <ContactCard instructorId={4} />
            <Specializations instructorId={4}/>
            <PricingCard instructorId={4} />
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
      />
    </div>
  );
};

export default InstructorProfile;
