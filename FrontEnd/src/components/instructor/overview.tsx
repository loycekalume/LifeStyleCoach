import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaUsers, FaCheckCircle, FaDumbbell, FaClock } from "react-icons/fa";

interface Stats {
  total_clients: number;
  sessions_completed: number;
  workouts_created: number;
  pending_sessions: number;
}

const Overview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    total_clients: 0,
    sessions_completed: 0,
    workouts_created: 0,
    pending_sessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Ensure this route matches your backend route file structure
        const res = await axiosInstance.get("/instructorStats/"); 
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper to render stat cards cleanly
  const renderCard = (label: string, value: number, icon: React.ReactNode, colorClass: string, subtext: string) => (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`} style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          width: '50px', height: '50px', borderRadius: '12px', fontSize: '1.5rem' 
      }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{loading ? "-" : value}</div>
        <div className="stat-label">{label}</div>
        <div className="stat-change">{subtext}</div>
      </div>
    </div>
  );

  return (
    <div className="card stats-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-chart-line"></i> Dashboard Overview
        </h3>
      </div>
      <div className="card-content">
        <div className="stats-grid">
          
          {/* 1. Total Clients */}
          {renderCard(
            "Active Clients", 
            stats.total_clients, 
            <FaUsers color="#3b82f6" />, // Blue
            "primary", 
            "Total Roster"
          )}

          {/* 2. Sessions Completed */}
          {renderCard(
            "Sessions Done", 
            stats.sessions_completed, 
            <FaCheckCircle color="#10b981" />, // Green
            "secondary", 
            "All Time"
          )}

          {/* 3. Workouts Created */}
          {renderCard(
            "Workouts Created", 
            stats.workouts_created, 
            <FaDumbbell color="#f59e0b" />, // Orange
            "accent", 
            "Library Total"
          )}

          {/* 4. Pending Sessions (Daily Focus) */}
          {renderCard(
            "Pending Sessions", 
            stats.pending_sessions, 
            <FaClock color="#6366f1" />, // Indigo
            "primary", 
            "Upcoming / To Do"
          )}

        </div>
      </div>
    </div>
  );
};

export default Overview;