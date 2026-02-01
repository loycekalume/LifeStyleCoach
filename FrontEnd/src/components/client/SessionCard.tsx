import  { useEffect, useState } from "react";
import { type JSX } from "react";
import axiosInstance from "../../utils/axiosInstance";
import type { Client } from "../../Services/clientViewService"; 
import { FaVideo, FaMapMarkerAlt, FaAppleAlt, FaDumbbell, FaCalendarDay } from "react-icons/fa";
import "./sessionCard.css"

interface SessionsCardProps {
  client: Client;
}

// Unified Interface for both types
interface Session {
  id: number;
  session_type: 'dietician' | 'instructor';
  session_title: string;
  host_name: string;
  session_date: string;
  start_time: string;
  meeting_link?: string; // Null if in-person
  status: string;
}

export default function SessionsCard({ client }: SessionsCardProps): JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
console.log(client)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axiosInstance.get("/clientSessions/");
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error("Failed to load sessions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Helper to format date (e.g., "Today", "Tomorrow", or "Feb 12")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper to format time (e.g., "14:00:00" -> "2:00 PM")
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="card sessions-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-calendar-check"></i> Upcoming Sessions
        </h3>
        <button className="btn-ghost">View All</button>
      </div>

      <div className="card-content">
        {loading ? (
             <div className="loading-state">Loading schedule...</div>
        ) : sessions.length === 0 ? (
             <div className="empty-state">
                <FaCalendarDay size={24} color="#cbd5e1"/>
                <p>No upcoming sessions scheduled.</p>
             </div>
        ) : (
             <div className="sessions-list">
               {sessions.map((session) => (
                 <div key={`${session.session_type}-${session.id}`} className="session-item">
                    
                    {/* Time Column */}
                    <div className="session-time">
                      <div className="time">{formatTime(session.start_time)}</div>
                      <div className="date">{formatDate(session.session_date)}</div>
                    </div>

                    {/* Info Column */}
                    <div className="session-info">
                      <div className="session-title-row">
                          {/* Type Icon */}
                          <span className={`type-icon ${session.session_type}`}>
                              {session.session_type === 'dietician' ? <FaAppleAlt /> : <FaDumbbell />}
                          </span>
                          <span className="session-title">{session.session_title}</span>
                      </div>

                      <div className="session-instructor">
                        <div className="avatar-placeholder">
                            {session.host_name.charAt(0)}
                        </div>
                        <span>with {session.host_name}</span>
                      </div>

                      <div className="session-location">
                        {session.meeting_link ? (
                            <>
                                <FaVideo className="icon-video" /> 
                                <span className="online-tag">Online Session</span>
                            </>
                        ) : (
                            <>
                                <FaMapMarkerAlt className="icon-map" /> 
                                <span>In-Person</span>
                            </>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="session-actions">
                      {session.meeting_link ? (
                          <a 
                            href={session.meeting_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary btn-sm"
                          >
                            Join
                          </a>
                      ) : (
                          <button className="btn btn-outline btn-sm">Details</button>
                      )}
                    </div>
                 </div>
               ))}
             </div>
        )}
      </div>
    </div>
  );
}