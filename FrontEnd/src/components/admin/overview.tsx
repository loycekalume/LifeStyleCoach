import React, { useEffect, useState } from "react";
import { getOverview } from "../../Services/adminService";

type OverviewData = {
  totalClients: number;
  verifiedExperts: number;
  pendingApprovals: number;
  avgStreak: number | string;
};

const OverviewCards: React.FC = () => {
  const [stats, setStats] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // ✅ No token needed here anymore
        const data = await getOverview(); 
        
        // Ensure data is valid before setting state
        if (data && typeof data === 'object') {
            setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
        // Fallback data for demo/error state
        setStats({
          totalClients: 0,
          verifiedExperts: 0,
          pendingApprovals: 0,
          avgStreak: "0 Days",
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
        <div className="card">
          <div className="card-icon green">
            <i className="fas fa-user-friends" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.totalClients)}</h3>
            <p>Total Clients</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon yellow">
            <i className="fas fa-certificate" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.verifiedExperts)}</h3>
            <p>Verified Experts</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon lightgreen">
            <i className="fas fa-hourglass-half" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.pendingApprovals)}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon teal">
            <i className="fas fa-fire" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats?.avgStreak)}</h3>
            <p>Avg. Workout Streak</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewCards;