import React from "react";
import type { Client } from "../../Services/clientViewService"; // 1. Import Type
import "./GoalsCard.css";

// 2. Define Interface
interface GoalsCardProps {
  client: Client;
}

// 3. Update component to accept the prop
const GoalsCard: React.FC<GoalsCardProps> = ({ client }) => {
  
  // 4. Use the client data (This fixes "value never read" error)
  // We use their actual weight goal, or a default if missing
  const primaryGoal = client.weight_goal || "Improve Overall Health";

  return (
    <div className="card goals-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-target"></i> Goals & Achievements
        </h3>
        <button className="btn-ghost">Set Goal</button>
      </div>

      <div className="card-content">
        <div className="goals-list">

          {/* Goal 1 - Linked to Real Client Data */}
          <div className="goal-item">
            <div className="goal-info">
              {/* ✅ USING THE PROP HERE */}
              <div className="goal-title">{primaryGoal}</div> 
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <span>In Progress</span>
              </div>
            </div>
            <div className="goal-status">
              <span className="goal-deadline">Active Goal</span>
            </div>
          </div>

          {/* Goal 2 (Static Example) */}
          <div className="goal-item">
            <div className="goal-info">
              <div className="goal-title">Run 5K under 25 minutes</div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: "80%" }}
                  ></div>
                </div>
                <span>Current: 26:30</span>
              </div>
            </div>
            <div className="goal-status">
              <span className="goal-deadline">2 weeks left</span>
            </div>
          </div>

          {/* Completed Goal (Static Example) */}
          <div className="goal-item completed">
            <div className="goal-info">
              <div className="goal-title">Complete 30-day challenge</div>
              <div className="goal-achievement">
                <i className="fas fa-trophy"></i>
                <span>Completed!</span>
              </div>
            </div>
            <div className="goal-status">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoalsCard;