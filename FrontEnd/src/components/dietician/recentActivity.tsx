
import React from "react";

export interface ActivityItem {
  avatar: string;
  client: string;
  action: string;
  time: string;
  statusLabel: string;
  statusType: "good" | "excellent" | "pending";
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="card activity-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-activity"></i> Recent Client Activity
        </h3>
        <button className="btn-ghost">View All</button>
      </div>
      <div className="card-content">
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-avatar">
                <img src={activity.avatar} alt={activity.client} />
              </div>
              <div className="activity-info">
                <div className="activity-client">{activity.client}</div>
                <div className="activity-action">{activity.action}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
              <div className="activity-status">
                <div className={`adherence ${activity.statusType}`}>
                  {activity.statusLabel === "calories" ? (
                    <span>{activity.statusLabel}</span>
                  ) : null}
                  <i
                    className={`fas ${
                      activity.statusType === "good"
                        ? "fa-check-circle"
                        : activity.statusType === "excellent"
                        ? "fa-star"
                        : "fa-clock"
                    }`}
                  ></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
