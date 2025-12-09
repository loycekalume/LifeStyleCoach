import { type JSX } from "react";

export default function ActivityCard(): JSX.Element {
  return (
    <div className="card activity-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-history"></i> Recent Activity
        </h3>
      </div>

      <div className="card-content">
        <div className="activity-list">

          <div className="activity-item">
            <div className="activity-icon workout">
              <i className="fas fa-dumbbell"></i>
            </div>
            <div className="activity-info">
              <div className="activity-title">Completed Upper Body Workout</div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-stats">
              <span className="stat">45 min</span>
              <span className="stat">320 cal</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon meal">
              <i className="fas fa-utensils"></i>
            </div>
            <div className="activity-info">
              <div className="activity-title">Logged lunch meal</div>
              <div className="activity-time">4 hours ago</div>
            </div>
            <div className="activity-stats">
              <span className="stat">520 cal</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon session">
              <i className="fas fa-video"></i>
            </div>
            <div className="activity-info">
              <div className="activity-title">Attended Yoga session with Sarah</div>
              <div className="activity-time">Yesterday</div>
            </div>
            <div className="activity-stats">
              <span className="stat">60 min</span>
              <span className="stat">180 cal</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon achievement">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="activity-info">
              <div className="activity-title">Achieved weekly step goal!</div>
              <div className="activity-time">2 days ago</div>
            </div>
            <div className="activity-stats">
              <span className="stat">70,000 steps</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

