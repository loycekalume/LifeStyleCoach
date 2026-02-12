import React, { useEffect, useState } from "react";
import Sidebar from "../components/admin/sidebar";
import Topbar from "../components/admin/topBar";
import OverviewCards from "../components/admin/overview";
import EngagementChart from "../components/admin/engagement"; 
import AIStats from "../components/admin/aiStats";
import UserTable from "../components/admin/userTable";
import { getUserEngagement } from "../Services/adminService";

import "../styles/admin.css";

// Type definition matches the backend response exactly
type EngagementPayload = {
  labels: string[];
  mealLogs: number[];
  workouts: number[];
  newUsers: number[];
};

const AdminDashboard: React.FC = () => {
  const [engagement, setEngagement] = useState<EngagementPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserEngagement();
        
        // If API returns valid data, use it
        if (res && res.labels) {
            setEngagement(res);
        }
      } catch (err) {
        console.error("Failed to fetch engagement stats, using fallback", err);
        // Fallback demo data if API fails or backend isn't ready
        setEngagement({
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          mealLogs: [0, 0, 0, 0, 0, 0, 0],
          workouts: [0, 0, 0, 0, 0, 0, 0],
          newUsers: [0, 0, 0, 0, 0, 0, 0],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content1">
        <Topbar />
        
        {/* Key Metrics Cards */}
        <OverviewCards />

        <section className="analytics">
          {/* Engagement Chart Section */}
          <div className="dashboard-section card-box">
            <div className="section-header">
              <h3>User Engagement Overview</h3>
              <select className="time-filter">
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="chart-wrapper">
              {loading ? (
                <div className="loading-chart">Loading statistics...</div>
              ) : engagement ? (
                <EngagementChart
                  labels={engagement.labels}
                  mealLogs={engagement.mealLogs}
                  workouts={engagement.workouts}
                  newUsers={engagement.newUsers}
                />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>

          {/* AI Stats / Side Panel */}
          <AIStats />
        </section>

        {/* Recent Users Table */}
        <UserTable />
      </main>
    </div>
  );
};

export default AdminDashboard;