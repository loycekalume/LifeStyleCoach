import React, {  useState } from "react";
import "../styles/Client.css"
import MealForm from "../components/mealLogs";
import BookSession from "../components/bookSession";

const Client: React.FC = () => {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showForm,setShowForm] =useState(false)



  return(
    <div>
      {/* Navigation bar */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Brand logo */}
          <div className="nav-brand">
            <div className="logo">
              <i className="fas fa-heart"></i>
              <span>LifeStyle Coach</span>
            </div>
          </div>

          {/* Navigation menu links */}
          <div className="nav-menu">
            <a href="#" className="nav-link active">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-dumbbell"></i>
              <span>Workouts</span>
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-utensils"></i>
              <span>Nutrition</span>
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-users"></i>
              <span>Instructors</span>
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-calendar"></i>
              <span>Schedule</span>
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-chart-line"></i>
              <span>Progress</span>
            </a>
          </div>

          {/* Profile dropdown menu */}
          <div className="nav-profile">
            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="Profile"
                />
                <span>John Doe</span>
                <i className="fas fa-chevron-down"></i>
              </button>

              {/* Dropdown menu items */}
              {dropdownOpen && (
                <div className="dropdown-menu show">
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-user"></i> Profile Settings
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-bell"></i> Notifications
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-credit-card"></i> Billing
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <div className="container">

          {/* Welcome section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, John👋</h1>
              <p>Ready to crush your fitness goals today?</p>
            </div>

            {/* Quick action buttons */}
            <div className="quick-actions">
              <button
                className="action-btn primary"
                onClick={() => alert("Start Workout functionality")}
              >
                <i className="fas fa-play"></i> Start Workout
              </button>
            <BookSession />
              <button
                className="action-btn tertiary"
                onClick={() =>setShowForm(true)}
              >
                <i className="fas fa-camera"></i> Log Meal
              </button>

              {showForm && <MealForm onClose={()=>setShowForm(false)}/> }
            </div>
          </section>

        

        </div>


      </main>
    </div>
   
)};

export default Client;


