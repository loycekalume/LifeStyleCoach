// src/components/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/admin/sidebar";
import Topbar from "../components/admin/topBar";
import OverviewCards from "../components/admin/overview";
import EngagementChart from "../components/admin/engagement";
import AIStats from "../components/admin/aiStats";
import UserTable from "../components/admin/userTable";
import { getUserEngagement } from "../Services/adminService";

import "../styles/admin.css";

type EngagementPayload = {
  labels: string[];
  mealLogs: number[];
  workouts: number[];
  newUsers: number[];
};

const AdminDashboard: React.FC = () => {
  const [engagement, setEngagement] = useState<EngagementPayload | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUserEngagement();
setEngagement(res);
      } catch (err) {
        // fallback demo data
        setEngagement({
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          mealLogs: [20, 35, 30, 40, 45, 25, 15],
          workouts: [15, 20, 25, 30, 35, 20, 10],
          newUsers: [5, 8, 6, 10, 12, 4, 3],
        });
      }
    };
    fetch();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content1">
        <Topbar />
        <OverviewCards />

        <section className="analytics">
          <div className="dashboard-section">
            <h3>User Engagement Overview</h3>
            {engagement && (
              <EngagementChart
                labels={engagement.labels}
                mealLogs={engagement.mealLogs}
                workouts={engagement.workouts}
                newUsers={engagement.newUsers}
              />
            )}
          </div>

          <AIStats />
        </section>

        <UserTable />
      </main>
    </div>
  );
};

export default AdminDashboard;
