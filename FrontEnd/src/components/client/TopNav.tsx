import { useState } from "react";
import { FaHome, FaDumbbell, FaUtensils, FaUsers, FaCalendar, FaChartLine, FaChevronDown, FaUser, FaBell, FaCreditCard, FaSignOutAlt, FaHeart } from "react-icons/fa";
import "./TopNav.css"

interface TopNavProps {
    currentPage: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";
  onNavigate?: (page: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress") => void;
}

export default function TopNav({ currentPage,onNavigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

 

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo / Brand */}
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
    className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
    onClick={(e) => { e.preventDefault(); onNavigate?.("dashboard"); }}
  >
    <FaHome /><span>Dashboard</span>
  </a>

  <a
    href="#"
   className={`nav-link ${currentPage === "workouts" ? "active" : ""}`}
    onClick={(e) => { e.preventDefault(); onNavigate?.("workouts"); }}
  >
    <FaDumbbell /><span>Workouts</span>
  </a>

  <a
    href="#"
    className={`nav-link ${currentPage === "nutrition" ? "active" : ""}`}
    onClick={(e) => { e.preventDefault(); onNavigate?.("nutrition"); }}
  >
    <FaUtensils /><span>Nutrition</span>
  </a>

  <a
    href="#"
     className={`nav-link ${currentPage === "instructors" ? "active" : ""}`}
    onClick={(e) => { e.preventDefault(); onNavigate?.("instructors"); }}
  >
    <FaUsers /><span>Instructors</span>
  </a>

  <a
    href="#"
    className={`nav-link ${currentPage === "schedule" ? "active" : ""}`}
    onClick={(e) => { e.preventDefault(); onNavigate?.("schedule"); }}
  >
    <FaCalendar /><span>Schedule</span>
  </a>

  <a
    href="#"
    className="nav-link"
    onClick={(e) => { e.preventDefault(); onNavigate?.("progress"); }}
  >
    <FaChartLine /><span>Progress</span>
  </a>
</div>


        {/* Profile / Dropdown */}
        <div className="nav-profile">
          <div className="profile-dropdown">
            <button className="profile-btn" onClick={toggleDropdown}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                alt="Profile" 
              />
              <span>John Doe</span>
              <FaChevronDown />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item"><FaUser /> Profile Settings</a>
                <a href="#" className="dropdown-item"><FaBell /> Notifications</a>
                <a href="#" className="dropdown-item"><FaCreditCard /> Billing</a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item"><FaSignOutAlt /> Sign Out</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
