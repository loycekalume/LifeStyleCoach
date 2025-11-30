import { type JSX } from "react";

export default function SessionsCard(): JSX.Element {
  return (
    <div className="card sessions-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-calendar-check"></i> Upcoming Sessions
        </h3>
        <button className="btn-ghost">View All</button>
      </div>

      <div className="card-content">
        <div className="sessions-list">

          {/* Session 1 */}
          <div className="session-item">
            <div className="session-time">
              <div className="time">2:00 PM</div>
              <div className="date">Today</div>
            </div>

            <div className="session-info">
              <div className="session-title">HIIT Training</div>

              <div className="session-instructor">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=30&h=30&fit=crop&crop=face"
                  alt="Maria"
                />
                <span>with Maria Rodriguez</span>
              </div>

              <div className="session-location">
                <i className="fas fa-video"></i> Online Session
              </div>
            </div>

            <div className="session-actions">
              <button className="btn btn-primary btn-sm">Join</button>
              <button className="btn btn-ghost btn-sm">Reschedule</button>
            </div>
          </div>

          {/* Session 2 */}
          <div className="session-item">
            <div className="session-time">
              <div className="time">10:00 AM</div>
              <div className="date">Tomorrow</div>
            </div>

            <div className="session-info">
              <div className="session-title">Yoga Flow</div>

              <div className="session-instructor">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face"
                  alt="Sarah"
                />
                <span>with Sarah Johnson</span>
              </div>

              <div className="session-location">
                <i className="fas fa-map-marker-alt"></i> Downtown Studio
              </div>
            </div>

            <div className="session-actions">
              <button className="btn btn-outline btn-sm">Details</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
