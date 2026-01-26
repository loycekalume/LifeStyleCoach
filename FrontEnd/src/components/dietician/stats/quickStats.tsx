import React, { useState, useEffect } from "react";
import { FaUsers, FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance";
import "./QuickStats.css"; 

// --- 1. StatCard Component (Internal or Separate File) ---
interface StatCardProps {
  icon: React.ReactNode; // Changed from string class to React Node for icons
  value: number | string;
  label: string;
  type: "clients" | "plans" | "consultations";
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, type }) => {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

// --- 2. Main QuickStats Container ---
export default function QuickStats() {
  const [stats, setStats] = useState({
    active_clients: 0,
    total_meal_plans: 0,
    today_sessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/dietician/stats");
        
        // Handle response safely
        const data = response.data.data || response.data;
        
        setStats({
            active_clients: data.active_clients || 0,
            total_meal_plans: data.total_meal_plans || 0,
            today_sessions: data.today_sessions || 0
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="quick-stats-container">
      <StatCard
        icon={<FaUsers />}
        value={loading ? "-" : stats.active_clients}
        label="Active Clients"
        type="clients"
      />

      <StatCard
        icon={<FaClipboardList />}
        value={loading ? "-" : stats.total_meal_plans}
        label="Meal Plans"
        type="plans"
      />

      <StatCard
        icon={<FaCalendarCheck />}
        value={loading ? "-" : stats.today_sessions}
        label="Today's Sessions"
        type="consultations"
      />
    </div>
  );
}