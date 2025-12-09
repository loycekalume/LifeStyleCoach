import React from "react";
import "./GoalsCard.css";

const GoalsCard: React.FC = () => {
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

          {/* Goal 1 */}
          <div className="goal-item">
            <div className="goal-info">
              <div className="goal-title">Lose 10 lbs</div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <span>6 lbs lost</span>
              </div>
            </div>
            <div className="goal-status">
              <span className="goal-deadline">4 weeks left</span>
            </div>
          </div>

          {/* Goal 2 */}
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

          {/* Completed Goal */}
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
