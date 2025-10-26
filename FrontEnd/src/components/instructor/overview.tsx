import React from "react";

const Overview: React.FC = () => {
  return (
    <div className="card stats-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-chart-bar"></i> Monthly Overview
        </h3>
      </div>
      <div className="card-content">
        <div className="stats-grid">
          {/* Total Clients */}
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-trending-up"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">47</div>
              <div className="stat-label">Total Clients</div>
              <div className="stat-change">+8 this month</div>
            </div>
          </div>

          {/* Sessions Completed */}
          <div className="stat-card">
            <div className="stat-icon secondary">
              <i className="fas fa-trending-up"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">156</div>
              <div className="stat-label">Sessions Completed</div>
              <div className="stat-change">+23 this month</div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="stat-card">
            <div className="stat-icon accent">
              <i className="fas fa-trending-up"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">$3,240</div>
              <div className="stat-label">Monthly Earnings</div>
              <div className="stat-change">+15% vs last month</div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-trending-up"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">4.9</div>
              <div className="stat-label">Average Rating</div>
              <div className="stat-change">Based on 89 reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
