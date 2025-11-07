import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Session {
    id: number;
    session_type: string;
    duration: number;
    scheduled_at: string;
    status: string;
    notes?: string;
    client_id: number;
    client_name: string;
    instructor_id: number;
    instructor_name: string;
    meeting_link?: string;
    chat_link?: string;
}

const UpcomingSessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    // 🛑 FIX 1: State for dynamic instructor ID
    const [instructorId, setInstructorId] = useState<number | null>(null);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    // ✅ FIX: Fetch and set the specialized Instructor ID from localStorage on mount
    useEffect(() => {
        // Read the specific instructorId, not the generic userId
        const storedId = localStorage.getItem("instructorId");
        if (storedId) {
            setInstructorId(parseInt(storedId, 10));
        }
    }, []);

    useEffect(() => {
        // Only run fetch if we have a valid ID
        if (instructorId === null) return;

        const fetchSessions = async () => {
            try {
                const res = await fetch("http://localhost:3000/sessions");
                const data = await res.json();

                // ✅ FIX 2: Use the dynamic instructorId state for filtering
                const filtered = data
                    .filter((s: Session) => s.instructor_id === instructorId)
                    .sort(
                        (a: Session, b: Session) =>
                            new Date(a.scheduled_at).getTime() -
                            new Date(b.scheduled_at).getTime()
                    );

                setSessions(filtered);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            }
        };

        fetchSessions();
    }, [instructorId]); // Depend on the dynamic ID

    // Pagination
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

    // Render loading state if ID hasn't been fetched yet
    if (instructorId === null) {
        return (
            <div className="card sessions-card">
                <div className="card-header">
                    <h3><i className="fas fa-calendar"></i> Upcoming Sessions</h3>
                </div>
                <div className="card-content">
                    <p>Loading session data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card sessions-card">
            <div className="card-header">
                <h3>
                    <i className="fas fa-calendar"></i> Upcoming Sessions
                </h3>
                <button className="btn btn-ghost" onClick={() => navigate("/sessions")}>
                    View Schedule
                </button>
            </div>
            <div className="card-content">
                <div className="sessions-list">
                    {currentSessions.length > 0 ? (
                        currentSessions.map((session) => (
                            <div key={session.id} className="session-item">
                                <div className="session-info">
                                    <div className="session-avatar">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                session.client_name
                                            )}&background=random`}
                                            alt={session.client_name}
                                        />
                                    </div>
                                    <div className="session-details">
                                        <div className="session-client">{session.client_name}</div>
                                        <div className="session-type">
                                            {session.session_type} • {session.duration} min
                                        </div>
                                        <div className="session-time">
                                            {new Date(session.scheduled_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="session-actions">
                                    <span
                                        className={`badge ${session.status === "confirmed"
                                            ? "badge-success"
                                            : session.status === "pending"
                                                ? "badge-warning"
                                                : session.status === "cancelled"
                                                    ? "badge-danger"
                                                    : session.status === "completed"
                                                        ? "badge-info"
                                                        : "badge-secondary"
                                            }`}
                                    >
                                        {session.status}
                                    </span>

                                    {/* Chat link */}
                                    {session.chat_link ? (
                                        <a
                                            href={session.chat_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-icon"
                                        >
                                            <i className="fas fa-comment"></i>
                                        </a>
                                    ) : (
                                        <button className="btn btn-icon" disabled>
                                            <i className="fas fa-comment"></i>
                                        </button>
                                    )}

                                    {/* Meeting link */}
                                    {session.meeting_link ? (
                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-icon"
                                        >
                                            <i className="fas fa-video"></i>
                                        </a>
                                    ) : (
                                        <button className="btn btn-icon" disabled>
                                            <i className="fas fa-video"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No upcoming sessions</p>
                    )}
                </div>

                {/* ✅ Pagination Controls */}
                {sessions.length > itemsPerPage && (
                    <div className="pagination">
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingSessions;
