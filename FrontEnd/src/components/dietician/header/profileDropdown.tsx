import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance"; 
import ProfileModal from "./profileModal";
import SpecializationModal from "./specializationModal";
import "./../../../styles/header.css";
import PricingModal from "./pricingModal";
import CertificationModal from "./certificationsModal";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);

  const navigate = useNavigate();

  //  Fetch logged-in dietician profile on mount
  useEffect(() => {
    async function fetchUserName() {
      try {
        const res = await axiosInstance.get("/dietician/profile"); 

        const data = res.data;
        setUserName(`Dr. ${data.name || "User"}`);
      } catch (error) {
        console.error("Error fetching user name", error);
        setUserName("Dr. User");
      }
    }

    fetchUserName();
  }, []);

  //  Sign Out Handler
  const handleSignOut = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    
    if (!confirmed) return;

    try {
      await axiosInstance.post("/auth/logout"); // 👈 Changed

      // Clear any local storage if you're using it
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login page
      navigate("/login");

    } catch (error) {
      console.error("Error signing out", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="profile-dropdown">
      {/* Dropdown Button */}
      <button className="profile-btn" onClick={() => setOpen(!open)}>
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
          alt="Dietician Profile"
        />
        <span>{userName}</span>
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

        <button className="dropdown-item" onClick={() => { setShowSpecializationModal(true); setOpen(false); }}>
          <i className="fas fa-stethoscope"></i> Specialization
        </button>

        <button
          className="dropdown-item"
          onClick={() => {
            setShowPricingModal(true);
            setOpen(false);
          }}
        >
          <i className="fas fa-tag"></i> Pricing
        </button>

        <button
          className="dropdown-item"
          onClick={() => {
            setShowCertificationModal(true);
            setOpen(false);
          }}
        >
          <i className="fas fa-certificate"></i> Certification
        </button>

        <div className="dropdown-divider"></div>

        {/* Sign Out Button */}
        <button
          className="dropdown-item"
          onClick={handleSignOut}
          style={{ color: "#ef4444" }}
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedName) => setUserName(`Dr. ${updatedName}`)}
        />
      )}
      {/* specialization modal */}
      {showSpecializationModal && <SpecializationModal
        onClose={() => setShowSpecializationModal(false)} />}

      {/* pricing modal */}
      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} />
      )}

      {/*  Certification Modal */}
      {showCertificationModal && (
        <CertificationModal onClose={() => setShowCertificationModal(false)} />
      )}
    </div>
  );
}