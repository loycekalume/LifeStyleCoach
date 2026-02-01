import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

interface Session {
    id: number;
    session_type: string;
    duration: number;
    scheduled_at: string;
    status: string;
    client_name: string;
    meeting_link?: string;
    chat_link?: string;
}

const UpcomingSessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axiosInstance.get("/sessions/");
                const data = res.data.sessions || [];
                const sorted = data.sort((a: Session, b: Session) => 
                    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                );
                setSessions(sorted);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // Pagination
    const totalPages = Math.ceil(sessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

    // --- STYLES HELPER ---
    const getBadgeStyle = (status: string) => {
        const baseStyle = { padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' as const };
        switch (status) {
            case 'pending': return { ...baseStyle, background: '#e0f2fe', color: '#0284c7' }; // Blue
            case 'completed': return { ...baseStyle, background: '#dcfce7', color: '#166534' }; // Green
            case 'cancelled': return { ...baseStyle, background: '#fee2e2', color: '#991b1b' }; // Red
            default: return { ...baseStyle, background: '#f3f4f6', color: '#374151' }; // Grey
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading schedule...</div>;

    return (
        <div className="card" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', padding: '20px' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                    <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i> Upcoming Sessions
                </h3>
                <button 
                    onClick={() => navigate("/sessions")}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    View Schedule
                </button>
            </div>

            {/* LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {currentSessions.length > 0 ? (
                    currentSessions.map((session) => (
                        <div key={session.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', // Pushes Left group and Right group apart
                            alignItems: 'center', // Vertically centers
                            padding: '15px 0', 
                            borderBottom: '1px solid #f1f5f9' 
                        }}>
                            
                            {/* LEFT SIDE: Avatar + Text Details */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {/* Avatar */}
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.client_name)}&background=random`}
                                    alt={session.client_name}
                                    style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '2px solid #f1f5f9'
                                    }}
                                />
                                
                                {/* Text Column */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                                        {session.client_name}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {session.session_type} • {session.duration} min
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                        {new Date(session.scheduled_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Badge + Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Status Badge */}
                                <span style={getBadgeStyle(session.status)}>
                                    {session.status === 'pending' ? 'Upcoming' : session.status}
                                </span>

                                {/* Chat Icon */}
                                {session.chat_link ? (
                                    <a href={session.chat_link} target="_blank" rel="noreferrer" 
                                       style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:'#f8fafc', color:'#64748b', textDecoration:'none' }}>
                                        <i className="fas fa-comment"></i>
                                    </a>
                                ) : (
                                    <div style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:'#f1f5f9', color:'#cbd5e1' }}>
                                        <i className="fas fa-comment"></i>
                                    </div>
                                )}

                                {/* Video Icon */}
                                {session.meeting_link ? (
                                    <a href={session.meeting_link} target="_blank" rel="noreferrer" 
                                       style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:'#f8fafc', color:'#8b5cf6', textDecoration:'none' }}>
                                        <i className="fas fa-video"></i>
                                    </a>
                                ) : (
                                    <div style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', background:'#f1f5f9', color:'#cbd5e1' }}>
                                        <i className="fas fa-video"></i>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        No upcoming sessions found.
                    </div>
                )}
            </div>

            {/* FOOTER / PAGINATION */}
            {sessions.length > itemsPerPage && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)}
                        style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        Prev
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpcomingSessions;