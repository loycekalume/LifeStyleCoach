import { useState, useEffect } from "react";
import axios from "axios";
import ProfileModal from "./profileModal";
import "./../../../styles/header.css";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState("Loading..."); 

  const API_BASE = "http://localhost:3000";

  //  Fetch logged-in dietician profile on mount
  useEffect(() => {
    async function fetchUserName() {
      try {
        const res = await axios.get(`${API_BASE}/dietician/profile`, {
          withCredentials: true, // Send auth cookie
        });

        const data = res.data;
        setUserName(`Dr. ${data.name || "User"}`); 
      } catch (error) {
        console.error("Error fetching user name", error);
        setUserName("Dr. User"); 
      }
    }

    fetchUserName();
  }, []);

  return (
    <div className="profile-dropdown">
      {/* Dropdown Button */}
      <button className="profile-btn" onClick={() => setOpen(!open)}>
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
          alt="Dietician Profile"
        />
        <span>{userName}</span> {/*  Will display "Dr. [Name]" */}
        <i className="fas fa-chevron-down"></i>
      </button>

      {/* Dropdown Menu */}
      <div className={`dropdown-menu ${open ? "show" : ""}`}>
        <button
          className="dropdown-item"
          onClick={() => {
            setShowProfileModal(true);
            setOpen(false);
          }}
        >
          <i className="fas fa-user"></i> Profile Settings
        </button>

        <button className="dropdown-item">
          <i className="fas fa-bell"></i> Specialization
        </button>

        <button className="dropdown-item">
          <i className="fas fa-chart-bar"></i> Pricing
        </button>

        <div className="dropdown-divider"></div>

        <button className="dropdown-item">
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          onClose={() => setShowProfileModal(false)} 
          onUpdate={(updatedName) => setUserName(`Dr. ${updatedName}`)} //  Add "Dr." when updating
        />
      )}
    </div>
  );
}