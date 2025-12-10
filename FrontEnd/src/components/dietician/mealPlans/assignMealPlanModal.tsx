import { useState, useEffect } from "react";
import { FaTimes, FaUser, FaCalendarAlt, FaStickyNote } from "react-icons/fa";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mealPlanTitle: string;
    mealPlanId: number;
}

interface ClientOption {
    user_id: number;
    name: string;
    email: string;
}

export default function AssignMealModal({ isOpen, onClose, mealPlanTitle, mealPlanId }: Props) {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [startDate, setStartDate] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch Clients when modal opens
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem("token");
            
            fetch("http://localhost:3000/client", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch clients");
                return res.json();
            })
            .then(data => {
                // ✅ Accessing the .clients array from your new controller structure
                if (data.clients) {
                    setClients(data.clients);
                } else if (Array.isArray(data)) {
                    setClients(data); // Fallback if API returns direct array
                }
            })
            .catch(err => console.error("Failed to load clients", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:3000/meal-plans/assign", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // ✅ Auth Header Added
                },
                body: JSON.stringify({
                    client_id: selectedClient,
                    meal_plan_id: mealPlanId,
                    start_date: startDate,
                    notes: notes
                    // ❌ assigned_by is NOT needed (backend gets it from token)
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Plan assigned successfully!");
                // Reset form
                setSelectedClient("");
                setNotes("");
                setStartDate("");
                onClose();
            } else {
                alert(result.message || "Failed to assign plan");
            }
        } catch (error) {
            console.error("Assignment error:", error);
            alert("An error occurred while assigning the plan.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", 
            alignItems: "center", zIndex: 1000
        }}>
            <div style={{
                background: "white", padding: "25px", borderRadius: "10px", 
                width: "400px", maxWidth: "90%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0 }}>Assign "{mealPlanTitle}"</h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem" }}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Client Dropdown */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>
                            <FaUser style={{ marginRight: "5px" }} /> Select Client
                        </label>
                        <select 
                            value={selectedClient} 
                            onChange={(e) => setSelectedClient(e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
                            required
                        >
                            <option value="">-- Choose a Client --</option>
                            {clients.map(client => (
                                <option key={client.user_id} value={client.user_id}>
                                    {client.name} ({client.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>
                            <FaCalendarAlt style={{ marginRight: "5px" }} /> Start Date
                        </label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>
                            <FaStickyNote style={{ marginRight: "5px" }} /> Notes (Optional)
                        </label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Instructions for the client..."
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd", background: "#f8f9fa", cursor: "pointer" }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "none", background: "#2ecc71", color: "white", cursor: "pointer" }}>
                            {loading ? "Assigning..." : "Assign Plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}