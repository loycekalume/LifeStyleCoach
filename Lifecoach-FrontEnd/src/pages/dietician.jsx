import React, { useState } from "react";
// import "./dietician.css";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dietician() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState({});

  // Progress chart data
  const progressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Average Weight Loss (lbs)",
        data: [2.1, 1.8, 2.3, 2.0, 2.5, 2.2],
        borderColor: "#00C853",
        backgroundColor: "rgba(0, 200, 83, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#00C853",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  // Macro chart data
  const macroData = {
    labels: ["Carbs", "Protein", "Fat"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ["#FFD54F", "#FF6B6B", "#4ECDC4"],
        borderWidth: 0,
      },
    ],
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="dietician-dashboard">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="header-left">
            <div className="logo">
              <i className="fas fa-heart"></i>
              <span>LifeStyle Coach</span>
            </div>
            <h1>Dietician Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              <i className="fas fa-plus"></i> New Meal Plan
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-calendar-plus"></i> Schedule Consultation
            </button>
            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
                  alt="Dr. Sarah Wilson"
                />
                <span>Dr. Sarah Wilson</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-user"></i> Profile Settings
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-bell"></i> Notifications
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-chart-bar"></i> Analytics
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
      </header>

      {/* Welcome Section */}
      <main className="main-content">
        <div className="container">
          <section className="welcome-section">
            <h2>Good morning, Dr. Wilson! 🥗</h2>
            <p>
              You have 8 consultations scheduled today and 3 meal plans pending
              review.
            </p>
          </section>

          {/* Progress Overview */}
          <div className="card progress-card">
            <h3>Client Progress Overview</h3>
            <div className="progress-chart">
              <Line data={progressData} />
            </div>
          </div>

          {/* Nutrition Analytics */}
          <div className="card analytics-card">
            <h3>Nutrition Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-item">
                <Doughnut data={macroData} />
              </div>
              <div className="analytics-info">
                <h4>Average Macro Distribution</h4>
                <p>Carbs 45%, Protein 30%, Fat 25%</p>
              </div>
            </div>
          </div>

          {/* Meal Plan Library Example */}
          <div className="card meal-plans-card">
            <h3>Meal Plan Library</h3>
            <div className="meal-plan-item">
              <h4>Mediterranean Diet Plan</h4>
              <button
                className={`plan-favorite ${favorites[1] ? "active" : ""}`}
                onClick={() => toggleFavorite(1)}
              >
                <i className="fas fa-heart"></i>
              </button>
              <p>7-day meal plan focused on healthy fats and lean proteins</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dietician;
