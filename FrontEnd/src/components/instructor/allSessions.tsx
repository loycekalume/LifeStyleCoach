import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Session {
    id: number;
    session_type: string;
    duration: number;
    scheduled_at: string;
    status: 'pending' | 'completed' | 'cancelled'; // Strict typing
    notes?: string;
    client_id: number;
    client_name: string;
    instructor_id: number;
    instructor_name: string;
    meeting_link?: string;
    chat_link?: string;
}

interface Client {
    user_id: number;
    name: string;
}

const SessionsPage: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Session>>({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const sessionsRes = await axiosInstance.get('/sessions/');
            setSessions(sessionsRes.data.sessions || []);

            const clientsRes = await axiosInstance.get('/instructorClients/my-clients');
            setClients(clientsRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "client_id" || name === "duration") {
             setFormData({ ...formData, [name]: value }); 
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Default to 'pending' if creating new
        const payload = {
            ...formData,
            client_id: Number(formData.client_id), 
            duration: Number(formData.duration),
            status: formData.status || 'pending', 
            scheduled_at: formData.scheduled_at
        };

        if (!payload.client_id || !payload.duration || !payload.scheduled_at) {
            alert("Please fill in Client, Duration, and Date.");
            return;
        }

        try {
            if (formData.id) {
                await axiosInstance.put(`/sessions/${formData.id}`, payload);
            } else {
                await axiosInstance.post("/sessions", payload);
            }
            setShowModal(false);
            setFormData({});
            fetchData();
        } catch (error: any) {
            console.error("Error saving session:", error);
            alert(error.response?.data?.message || "Failed to save session");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axiosInstance.delete(`/sessions/${id}`);
            setSessions(sessions.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    // ✅ Updated Status Colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':   return { bg: '#e0f2fe', color: '#0284c7' }; // Blue (Upcoming)
            case 'completed': return { bg: '#dcfce7', color: '#166534' }; // Green (Done)
            case 'cancelled': return { bg: '#fee2e2', color: '#991b1b' }; // Red
            default:          return { bg: '#f3f4f6', color: '#374151' }; // Grey
        }
    };

    // ✅ Helper to format label (e.g., "pending" -> "Upcoming")
    const getStatusLabel = (status: string) => {
        if (status === 'pending') return 'Upcoming'; 
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="sessions-page" style={{ padding: '20px' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>My Sessions</h2>
                <div className="actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => { setFormData({}); setShowModal(true); }}>
                        Schedule Session
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.history.back()}>
                        Back to Profile
                    </button>
                </div>
            </div>

            {loading ? <div>Loading...</div> : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb' }}>
                    <p>No sessions scheduled.</p>
                </div>
            ) : (
                <table className="sessions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Client</th>
                            <th style={{ padding: '10px' }}>Type</th>
                            <th style={{ padding: '10px' }}>Time</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => {
                            const badgeStyle = getStatusStyle(session.status);
                            return (
                                <tr key={session.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '10px' }}>{session.client_name}</td>
                                    <td style={{ padding: '10px' }}>{session.session_type}</td>
                                    <td style={{ padding: '10px' }}>{new Date(session.scheduled_at).toLocaleString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: '600',
                                            background: badgeStyle.bg,
                                            color: badgeStyle.color
                                        }}>
                                            {getStatusLabel(session.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', display:'flex', gap:'5px' }}>
                                        <button className="btn btn-warning btn-sm" onClick={() => { setFormData(session); setShowModal(true); }}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(session.id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '500px' }}>
                        <h3>{formData.id ? "Edit Session" : "Schedule Session"}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {formData.id ? (
                                <input type="text" value={formData.client_name || ""} disabled />
                            ) : (
                                <select name="client_id" value={formData.client_id || ""} onChange={handleChange} required style={{ padding: '10px' }}>
                                    <option value="">Select Client</option>
                                    {clients.map((c) => (
                                        <option key={c.user_id} value={c.user_id}>{c.name}</option>
                                    ))}
                                </select>
                            )}

                            <input type="text" name="session_type" placeholder="Type (e.g. HIIT)" value={formData.session_type || ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            <input type="number" name="duration" placeholder="Duration (min)" value={formData.duration || ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            <input type="datetime-local" name="scheduled_at" value={formData.scheduled_at ? formData.scheduled_at.slice(0, 16) : ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            
                            {/* ✅ Updated Dropdown Options */}
                            <select name="status" value={formData.status || "pending"} onChange={handleChange} style={{ padding: '10px' }}>
                                <option value="pending">Upcoming (Pending)</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">{formData.id ? "Update" : "Schedule"}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsPage;