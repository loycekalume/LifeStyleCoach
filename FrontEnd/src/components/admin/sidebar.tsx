// src/components/admin/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/admin.css";  

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar" id="sidebar">
      <div>
        <div className="sidebar-header">
          <i className="fas fa-leaf logo-icon" />
          <h2>LifeStyle Coach</h2>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-chart-line" /> Dashboard
          </NavLink>

         

          <NavLink
            to="/admin/instructors"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-dumbbell" /> Instructors
          </NavLink>

          <NavLink
            to="/admin/dieticians"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-apple-alt" /> Dieticians
          </NavLink>

          <NavLink
            to="/admin/clients"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="fas fa-user-friends" /> Clients
          </NavLink>

         

         

          
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/login">
          <i className="fas fa-sign-out-alt" /> Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
