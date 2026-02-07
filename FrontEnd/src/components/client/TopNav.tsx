import { useState, useEffect } from "react";
import { 
  FaHome, FaDumbbell, FaUtensils, FaUsers, 
  FaChartLine, FaChevronDown, FaUser, 
  FaSignOutAlt, FaHeart, 
  FaUserMd 
} from "react-icons/fa"; 
import "./TopNav.css";

import NotificationBell from "./../notifications"; 

import ClientProfileModal from "./profileModal";

interface TopNavProps {
  currentPage: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";
  onNavigate?: (page: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress") => void;
}

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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

  // ✅ 3. Handler to refresh name in Nav if updated in Modal
  const handleProfileUpdate = () => {
      const updatedName = localStorage.getItem("userName");
      if(updatedName) setUserName(updatedName);
  };

  return (
    <>
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
              <FaUserMd /><span>Dieticians</span>
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
            
            <div className="nav-bell-wrapper">
               <NotificationBell />
            </div>

            <div className="profile-dropdown">
              <button className="profile-btn" onClick={toggleDropdown}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                  alt="Profile" 
                />
                <span>{userName}</span>
                <FaChevronDown />
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {/* ✅ 4. Open Modal on click */}
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                        setIsProfileModalOpen(true);
                        setDropdownOpen(false); // Close dropdown
                    }}
                    style={{width:'100%', border:'none', background:'none', textAlign:'left', cursor:'pointer'}}
                  >
                    <FaUser /> Profile Settings
                  </button>
                
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

      {/* ✅ 5. Render Modal Component */}
      {isProfileModalOpen && (
        <ClientProfileModal 
            onClose={() => setIsProfileModalOpen(false)} 
            onUpdateSuccess={handleProfileUpdate}
        />
      )}
    </>
  );
}