import React, { useState } from "react";
import "../assets/styles/admin.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Admin() {
  // Sidebar + dropdown state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Chart Data
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [65000, 72000, 68000, 78000, 82000, 89000],
        borderColor: "#0288D1",
        backgroundColor: "rgba(2, 136, 209, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value / 1000}K`,
        },
      },
    },
  };

  const userGrowthData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Users",
        data: [45, 67, 89, 123],
        backgroundColor: "#00C853",
      },
      {
        label: "Active Users",
        data: [1890, 1945, 2012, 2103],
        backgroundColor: "#FFD54F",
      },
    ],
  };

  const userGrowthOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
  };

  return (
    <div className={`dashboard ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-shield-alt"></i>
            <span>Admin Panel</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#" className="nav-link active">
                <i className="fas fa-chart-pie"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Admin"
                />
                <div className="profile-info">
                  <span className="profile-name">Alex Johnson</span>
                  <span className="profile-role">System Admin</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu show">
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-user"></i> Profile Settings
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-container">
          {/* Metrics */}
          <section className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card users">
                <div className="metric-value">2,847</div>
                <div className="metric-label">Total Users</div>
              </div>
              <div className="metric-card revenue">
                <div className="metric-value">$89,247</div>
                <div className="metric-label">Monthly Revenue</div>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="charts-section">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Revenue Overview</h3>
                <Line data={revenueData} options={revenueOptions} />
              </div>
              <div className="chart-card">
                <h3>User Growth</h3>
                <Bar data={userGrowthData} options={userGrowthOptions} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
