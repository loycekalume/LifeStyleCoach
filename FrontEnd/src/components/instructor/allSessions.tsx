import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

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
        // Logic to keep numbers as numbers in state
        if (name === "client_id" || name === "duration") {
             setFormData({ ...formData, [name]: value }); // Keep as string for input, convert on submit
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ FIX 2: Explicit Payload Construction (Sanitization)
        // This prevents "400 Bad Request" by ensuring numbers are actual numbers
        const payload = {
            ...formData,
            client_id: Number(formData.client_id), 
            duration: Number(formData.duration),
            status: formData.status || 'pending',
            scheduled_at: formData.scheduled_at
        };

        // Simple validation check
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
                        {sessions.map((session) => (
                            <tr key={session.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '10px' }}>{session.client_name}</td>
                                <td style={{ padding: '10px' }}>{session.session_type}</td>
                                <td style={{ padding: '10px' }}>{new Date(session.scheduled_at).toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>{session.status}</td>
                                <td style={{ padding: '10px', display:'flex', gap:'5px' }}>
                                    <button className="btn btn-warning btn-sm" onClick={() => { setFormData(session); setShowModal(true); }}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(session.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '500px' }}>
                        <h3>{formData.id ? "Edit Session" : "Schedule Session"}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* Client Select */}
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

                            <input type="text" name="session_type" placeholder="Type" value={formData.session_type || ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            <input type="number" name="duration" placeholder="Duration (min)" value={formData.duration || ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            <input type="datetime-local" name="scheduled_at" value={formData.scheduled_at ? formData.scheduled_at.slice(0, 16) : ""} onChange={handleChange} required style={{ padding: '10px' }} />
                            <select name="status" value={formData.status || "pending"} onChange={handleChange} style={{ padding: '10px' }}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                            </select>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">{formData.id ? "Update" : "Create"}</button>
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