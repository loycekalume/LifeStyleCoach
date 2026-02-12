import React, { useEffect, useState } from "react";
import { getOverview } from "../../Services/adminService";

type OverviewData = {
  totalClients: number;
  verifiedExperts: number;   // This is now Instructors
  pendingApprovals: number;  // This is now Dieticians
  avgStreak: number ; // This is now All Users
};

const OverviewCards: React.FC = () => {
  const [stats, setStats] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getOverview();
        if (data && typeof data === 'object') {
            setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
        setStats({
          totalClients: 0,
          verifiedExperts: 0,
          pendingApprovals: 0,
          avgStreak: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fmt = (v: number | string | undefined) =>
    (typeof v === "number" ? v.toLocaleString() : v) || 0;

  if (loading) {
      return (
        <section className="overview">
            <h1>System Overview</h1>
            <p style={{ color: "#666" }}>Loading stats...</p>
        </section>
      );
  }

  return (
    <section className="overview">

      <h1>System Overview</h1>
      <div className="cards">
        {/* Card 1: Clients */}
        <div className="card">
          <div className="card-icon green">
            <i className="fas fa-user-friends" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.totalClients)}</h3>
            <p>Total Clients</p>
          </div>
        </div>

        {/* Card 2: Instructors */}
        <div className="card1">
          <div className="card-icon yellow">
            <i className="fas fa-dumbbell" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.verifiedExperts)}</h3>
            <p>Total Instructors</p>
          </div>
        </div>

        {/* Card 3: Dieticians */}
        <div className="card1">
          <div className="card-icon lightgreen">
            <i className="fas fa-carrot" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.pendingApprovals)}</h3>
            <p>Total Dieticians</p>
          </div>
        </div>

      

        {/* Card 4: All Users */}
        <div className="card1">
          <div className="card-icon teal">
            <i className="fas fa-users" />
          </div>
          <div className="card-info">
            {/* This will now show the real count (e.g., 150) instead of 5.2 */}
            <h3>{fmt(stats?.avgStreak)}</h3> 
            <p>Total Users</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewCards;