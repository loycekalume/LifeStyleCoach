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

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getOverview(token);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
        setStats({
          totalClients: 1504,
          verifiedExperts: 85,
          pendingApprovals: 7,
          avgStreak: "5.2 Days",
        });
      }
    };
    fetch();
  }, []);

  if (!stats) return <p>Loading...</p>;

  const fmt = (v: number | string) =>
    typeof v === "number" ? v.toLocaleString() : v;

  return (
    <section className="overview">
      <h1>System Overview</h1>
      <div className="cards">
        <div className="card">
          <div className="card-icon green">
            <i className="fas fa-user-friends" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats.totalClients)}</h3>
            <p>Total Clients</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon yellow">
            <i className="fas fa-certificate" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats.verifiedExperts)}</h3>
            <p>Verified Experts</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon lightgreen">
            <i className="fas fa-hourglass-half" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats.pendingApprovals)}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="card1">
          <div className="card-icon teal">
            <i className="fas fa-fire" />
          </div>
          <div className="card-info">
            <h3>{fmt(stats.avgStreak)}</h3>
            <p>Avg. Workout Streak</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewCards;
