import { useState, useEffect } from "react"; // Import useEffect
import { FaHome, FaDumbbell, FaUtensils, FaUsers, FaCalendar, FaChartLine, FaChevronDown, FaUser, FaBell, FaCreditCard, FaSignOutAlt, FaHeart } from "react-icons/fa";
import "./TopNav.css"
 // Assuming you use this for logout

interface TopNavProps {
  currentPage: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";
  onNavigate?: (page: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress") => void;
}

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User"); // Default state
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  // const navigate = useNavigate(); // Uncomment if you want logout logic

  // --- NEW: Fetch user details on load ---
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
     // logical cleanup
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


        {/* Profile / Dropdown */}
        <div className="nav-profile">
          <div className="profile-dropdown">
            <button className="profile-btn" onClick={toggleDropdown}>
              {/* Dynamic Avatar based on Name */}
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
                <a href="#" className="dropdown-item"><FaBell /> Notifications</a>
                <a href="#" className="dropdown-item"><FaCreditCard /> Billing</a>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item" style={{width:'100%', border:'none', background:'none', textAlign:'left', cursor:'pointer'}}><FaSignOutAlt /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}