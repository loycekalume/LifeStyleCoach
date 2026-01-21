import { useState, useEffect } from "react";
import { 
  FaHome, FaDumbbell, FaUtensils, FaUsers, FaCalendar, 
  FaChartLine, FaChevronDown, FaUser, FaCreditCard, 
  FaSignOutAlt, FaHeart 
} from "react-icons/fa"; // Removed FaBell since the component has its own
import "./TopNav.css";

// ✅ Import the new Notification Component
// Adjust the path if your folders are structured differently (e.g. "../common/NotificationBell")
import NotificationBell from "./../notifications"; 

interface TopNavProps {
  currentPage: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";
  onNavigate?: (page: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress") => void;
}

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Fetch user details on load
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
     localStorage.clear();
     window.location.href = "/login"; 
  };

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


        {/* Profile / Dropdown Section */}
        <div className="nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* ✅ 1. THE NOTIFICATION BELL */}
          <div className="nav-bell-wrapper">
             <NotificationBell />
          </div>

          {/* 2. PROFILE DROPDOWN */}
          <div className="profile-dropdown">
            <button className="profile-btn" onClick={toggleDropdown}>
              {/* Dynamic Avatar */}
              <img 
                src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                alt="Profile" 
              />
              {/* Dynamic Name */}
              <span>{userName}</span>
              <FaChevronDown />
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item"><FaUser /> Profile Settings</a>
                {/* Notification link removed (Redundant) */}
                <a href="#" className="dropdown-item"><FaCreditCard /> Billing</a>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item" style={{width:'100%', border:'none', background:'none', textAlign:'left', cursor:'pointer'}}>
                    <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}