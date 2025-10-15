import React from "react";
import {
  FaHeart,
  FaPlus,
  FaCalendarPlus,
  FaChevronDown,
  FaUser,
  FaBell,
  FaChartBar,
  FaSignOutAlt,
  FaUsers,
  FaClipboardList,
  FaCalendarCheck
} from "react-icons/fa";
import "../styles/Dietician.css";

const DieticianDashboard: React.FC = () => {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo">
                <FaHeart />
                <span>LifeStyle Coach</span>
              </div>
              <h1>Dietician Dashboard</h1>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline">
                <FaPlus /> New Meal Plan
              </button>
              <button className="btn btn-outline">
                <FaCalendarPlus /> Schedule Consultation
              </button>
              <div className="profile-dropdown">
                <button className="profile-btn">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
                    alt="Dr. Sarah Wilson"
                  />
                  <span>Dr. Sarah Wilson</span>
                  <FaChevronDown />
                </button>
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    <FaUser /> Profile Settings
                  </a>
                  <a href="#" className="dropdown-item">
                    <FaBell /> Notifications
                  </a>
                  <a href="#" className="dropdown-item">
                    <FaChartBar /> Analytics
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <FaSignOutAlt /> Sign Out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h2>Good morning, Dr. Wilson! 🥗</h2>
              <p>
                You have 8 consultations scheduled today and 3 meal plans pending
                review.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon clients">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <div className="stat-number">127</div>
                  <div className="stat-label">Active Clients</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon plans">
                  <FaClipboardList />
                </div>
                <div className="stat-info">
                  <div className="stat-number">89</div>
                  <div className="stat-label">Meal Plans</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon consultations">
                  <FaCalendarCheck />
                </div>
                <div className="stat-info">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Today's Sessions</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DieticianDashboard;
