import React, { useState, useEffect } from "react";
import { FaUsers, FaChevronRight, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
// ✅ Import axiosInstance
import axiosInstance from "../../../utils/axiosInstance";

interface ClientData {
  user_id: number;
  name: string;
  email: string;
  weight_goal?: string;
}

const RecentClients: React.FC = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClients() {
      try {
        
        const res = await axiosInstance.get("/dieticianClients/roster");
        
        // Handle different data structures safely
        const list = res.data.data || res.data.clients || res.data;
        setClients(Array.isArray(list) ? list : []);
        
      } catch (err) {
        console.error("Failed to load recent clients", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  // Limit to 4 clients
  const displayClients = clients.slice(0, 4);

  return (
    <div className="recent-clients-card" style={{
      background: "white",
      borderRadius: "15px",
      padding: "20px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#2c3e50", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaUsers color="#3498db" /> Recent Clients
        </h3>
        {/* Navigation Button */}
        <button 
          onClick={() => navigate("/dietician/clients")} // Ensure this route exists in your App.tsx
          style={{
            background: "none",
            border: "none",
            color: "#3498db",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          View All <FaArrowRight size={12} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
        {loading ? (
            <p style={{textAlign:"center", color:"#999"}}>Loading...</p>
        ) : displayClients.length === 0 ? (
            <p style={{textAlign:"center", color:"#999"}}>No clients yet.</p>
        ) : (
            displayClients.map((client) => (
            <div key={client.user_id} style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#f8f9fa",
                transition: "background 0.2s"
            }}>
                <img 
                src={`https://ui-avatars.com/api/?name=${client.name}&background=random&size=40`} 
                alt={client.name}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
                <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "0.95rem", color: "#2c3e50" }}>{client.name}</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#7f8c8d" }}>
                    {client.weight_goal || "General Health"}
                </p>
                </div>
                <FaChevronRight color="#bdc3c7" size={12} />
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default RecentClients;