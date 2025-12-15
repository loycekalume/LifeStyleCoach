import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaUser, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBullseye, 
  FaVenusMars,
  
} from "react-icons/fa";

// 1. Define the interface to match your SQL response exactly
interface ClientData {
  user_id: number;
  name: string;        // From users table
  email: string;       // From users table
  age?: number;        // From clients table
  gender?: string;     // From clients table
  location?: string;   // From clients table
  weight_goal?: string;// From clients table
}

export default function DieticianClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // 2. Fetch Data on Component Mount
  useEffect(() => {
    async function fetchClients() {
      const token = localStorage.getItem("token");
      
      // Safety check: ensure token exists
      if (!token) {
        setError("You are not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/meal-plans/clients", {
          headers: {
            "Authorization": `Bearer ${token}`, // Matches 'req.user' in backend
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        
        if (res.ok) {
          // Robust handling: data might be the array directly or inside data.clients
          const clientList = Array.isArray(data) ? data : (data.clients || []);
          setClients(clientList);
        } else {
          setError(data.message || "Failed to load clients");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  // 3. Filter Logic (Search by Name or Email)
  const filteredClients = clients.filter(client => 
    (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
      <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i>
      Loading your client list...
    </div>
  );

  return (
    <div className="dietician-clients-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <h1 style={{ color: "#2c3e50", margin: "0 0 10px 0" }}>My Clients</h1>
        <p style={{ color: "#7f8c8d", margin: 0 }}>View and manage the clients in your system.</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "30px", position: "relative", maxWidth: "500px" }}>
        <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#95a5a6" }} />
        <input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 12px 12px 45px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            outline: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: "#721c24", 
          backgroundColor: "#f8d7da", 
          padding: "15px", 
          borderRadius: "5px", 
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClients.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", background: "#f9f9f9", borderRadius: "10px", color: "#7f8c8d" }}>
          <FaUser size={40} style={{ marginBottom: "15px", color: "#bdc3c7" }} />
          <h3>No clients found.</h3>
          <p>Try searching for a different name or email.</p>
        </div>
      )}

      {/* Client Cards Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: "25px" 
      }}>
        {filteredClients.map((client) => (
          <div key={client.user_id} style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            padding: "20px",
            border: "1px solid #f1f2f6",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.2s ease"
          }}>
            
            {/* 1. Avatar, Name & Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              {/* Dynamic Avatar using Name */}
              <img 
                src={`https://ui-avatars.com/api/?name=${client.name}&background=2ecc71&color=fff&size=128`} 
                alt={client.name}
                style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ overflow: "hidden" }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "1.15rem", color: "#2c3e50", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {client.name}
                </h3>
                <span style={{ fontSize: "0.9rem", color: "#7f8c8d", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaEnvelope size={12} /> 
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {client.email}
                  </span>
                </span>
              </div>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid #eee", width: "100%", margin: "0 0 15px 0" }} />

            {/* 2. Client Details (Goals, Location, etc) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.9rem", color: "#555", marginBottom: "20px" }}>
               
               <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaVenusMars style={{ color: "#3498db" }} /> 
                  <span>{client.gender || "Unknown"}</span>
               </div>

               <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaMapMarkerAlt style={{ color: "#e74c3c" }} /> 
                  <span>{client.location || "Remote"}</span>
               </div>
               
               {/* Full width row for Goal */}
               <div style={{ display: "flex", alignItems: "center", gap: "8px", gridColumn: "1 / -1", background: "#f8f9fa", padding: "8px", borderRadius: "6px" }}>
                  <FaBullseye style={{ color: "#27ae60" }} /> 
                  <strong>Goal:</strong> {client.weight_goal || "General Wellness"}
               </div>

            </div>

            {/* 3. Action Button */}
            <button style={{
              marginTop: "auto",
              padding: "12px",
              background: "white",
              color: "#3498db",
              border: "2px solid #3498db",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = "#3498db";
                e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#3498db";
            }}
            >
              <FaUser /> View Full Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}