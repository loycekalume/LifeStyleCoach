import  { useState } from "react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="profile-dropdown">
      <button className="profile-btn" onClick={() => setOpen(!open)}>
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
          alt="Dr. Sarah Wilson"
        />
        <span>Dr. Sarah Wilson</span>
        <i className="fas fa-chevron-down"></i>
      </button>

      {open && (
        <div className="dropdown-menu">
          <a className="dropdown-item"><i className="fas fa-user"></i> Profile Settings</a>
          <a className="dropdown-item"><i className="fas fa-bell"></i> Notifications</a>
          <a className="dropdown-item"><i className="fas fa-chart-bar"></i> Analytics</a>
          <div className="dropdown-divider"></div>
          <a className="dropdown-item"><i className="fas fa-sign-out-alt"></i> Sign Out</a>
        </div>
      )}
    </div>
  );
}
