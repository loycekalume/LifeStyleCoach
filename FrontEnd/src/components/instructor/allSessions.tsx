import React, { useEffect, useState } from "react";

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
    id: number;
    name: string;
}

const SessionsPage: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Session>>({});
    
    // ✅ Get instructor ID from localStorage (or wherever you store it after login)
    const instructorId = parseInt(localStorage.getItem("instructorId") || "4");

    // ✅ Fetch only this instructor's sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/sessions?instructor_id=${instructorId}`
                );
                const data = await res.json();
                // Ensure data is an array
                setSessions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching sessions:", error);
                setSessions([]);
            }
        };

        const fetchClients = async () => {
            try {
                const res = await fetch("http://localhost:3000/client");
                const data = await res.json();
                console.log("Clients raw data:", data); // Debug log
                
                // ✅ Handle the actual API response structure
                let clientsArray: Client[] = [];
                
                if (data.clients && Array.isArray(data.clients)) {
                    // API returns { clients: [...] }
                    clientsArray = data.clients.map((client: any) => ({
                        id: client.user_id, // Backend uses user_id
                        name: client.name
                    }));
                } else if (Array.isArray(data)) {
                    // API returns direct array
                    clientsArray = data.map((client: any) => ({
                        id: client.user_id, // Backend uses user_id
                        name: client.name
                    }));
                } else {
                    console.error("Unexpected clients data format:", data);
                }
                
                console.log("Processed clients:", clientsArray); // Debug log
                setClients(clientsArray);
            } catch (error) {
                console.error("Error fetching clients:", error);
                setClients([]);
            }
        };

        fetchSessions();
        fetchClients();
    }, [instructorId]);

    // Handle form changes
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        
        // ✅ FIX: Ensure client_id is stored as a number
        if (name === "client_id") {
            setFormData({ 
                ...formData, 
                [name]: parseInt(value, 10) 
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Save session
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (formData.id) {
                // Update
                const response = await fetch(`http://localhost:3000/sessions/${formData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                
                if (!response.ok) {
                    throw new Error(`Update failed: ${response.statusText}`);
                }
            } else {
                // Create
                const response = await fetch("http://localhost:3000/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...formData,
                        instructor_id: instructorId,
                    }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Create failed: ${response.statusText}`);
                }
                
                console.log("Session created successfully");
            }
            
            // Close modal and refresh sessions
            setShowModal(false);
            setFormData({});
            
            // Refetch sessions instead of reloading the entire page
            const res = await fetch(
                `http://localhost:3000/sessions?instructor_id=${instructorId}`
            );
            const data = await res.json();
            setSessions(Array.isArray(data) ? data : []);
            
        } catch (error) {
            console.error("Error saving session:", error);
            alert(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Delete session
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this session?")) {
            return;
        }

        try {
            await fetch(`http://localhost:3000/sessions/${id}`, {
                method: "DELETE",
            });
            setSessions(sessions.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    return (
        <div className="sessions-page">
            <div className="page-header">
                <h2>My Sessions</h2>
                <div className="actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setFormData({});
                            setShowModal(true);
                        }}
                    >
                        Schedule Session
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => window.history.back()}
                    >
                        Back to Profile
                    </button>
                </div>
            </div>

            {/* Sessions Table */}
            {sessions.length === 0 ? (
                <div className="no-sessions">
                    <p>No sessions scheduled yet. Click "Schedule Session" to create one!</p>
                </div>
            ) : (
                <table className="sessions-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id}>
                                <td className="session-client">{session.client_name}</td>
                                <td className="session-type">{session.session_type}</td>
                                <td className="session-type">{session.duration} min</td>
                                <td className="session-time">
                                    {new Date(session.scheduled_at).toLocaleString()}
                                </td>
                                <td>
                                    <span
                                        className={`badge ${
                                            session.status === "confirmed"
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
                                </td>

                                <td>{session.notes || "-"}</td>
                                <td>
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => {
                                            setFormData(session);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(session.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{formData.id ? "Edit Session" : "Schedule Session"}</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Client field */}
                            {formData.id ? (
                                <input
                                    type="text"
                                    value={formData.client_name || ""}
                                    disabled
                                    className="disabled-input"
                                />
                            ) : (
                                <select
                                    name="client_id"
                                    value={formData.client_id || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <input
                                type="text"
                                name="session_type"
                                placeholder="Session Type (e.g., Personal Training, Nutrition Consultation)"
                                value={formData.session_type || ""}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="number"
                                name="duration"
                                placeholder="Duration (minutes)"
                                value={formData.duration || ""}
                                onChange={handleChange}
                                required
                                min="15"
                                step="15"
                            />
                            <input
                                type="datetime-local"
                                name="scheduled_at"
                                value={
                                    formData.scheduled_at
                                        ? formData.scheduled_at.slice(0, 16)
                                        : ""
                                }
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="status"
                                value={formData.status || "pending"}
                                onChange={handleChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <input
                                type="url"
                                name="meeting_link"
                                placeholder="Meeting Link (Zoom/Google Meet)"
                                value={formData.meeting_link || ""}
                                onChange={handleChange}
                            />

                            <input
                                type="url"
                                name="chat_link"
                                placeholder="Chat Link (WhatsApp/Slack/etc)"
                                value={formData.chat_link || ""}
                                onChange={handleChange}
                            />

                            <textarea
                                name="notes"
                                placeholder="Notes"
                                value={formData.notes || ""}
                                onChange={handleChange}
                            />

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">
                                    {formData.id ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsPage;