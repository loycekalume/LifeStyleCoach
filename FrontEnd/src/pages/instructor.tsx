import React from 'react';
import ProfileCard from '../components/instructor/profileCard';
import ContactCard from '../components/instructor/contactCard';
import Specializations from '../components/instructor/specializationCard';
import PricingCard from '../components/instructor/pricingCard';
import MonthlyStats from '../components/instructor/statsCard';
import UpcomingSessions from '../components/instructor/sessionsCard';
import Reviews from '../components/instructor/reviewCard';
import '../css/instructor.css';
import Overview from '../components/instructor/overview';

const InstructorProfile: React.FC = () => {
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile</h1>
            <div className="header-actions">
              <button className="btn btn-outline analytics-btn">
                <i className="fas fa-chart-bar"></i> Analytics
              </button>
              <button className="btn btn-outline settings-btn">
                <i className="fas fa-cog"></i> Settings
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
            <ContactCard />
            <Specializations />
            <PricingCard />
          </aside>
          <main className="profile-main">
            <Overview/>
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
