import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaBullseye, 
  FaVenusMars,
  FaRobot, // Icon for AI
  FaExclamationCircle
} from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance";

// 1. Updated Interface including AI Fields
interface ClientData {
  user_id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  location?: string;
  weight_goal?: string;
  // ✅ New AI Fields
  match_score?: number;
  match_reason?: string;
  health_conditions?: string[];
}

export default function DieticianClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // 2. Fetch AI MATCHED Clients
  useEffect(() => {
    fetchAiMatches();
  }, []);

  const fetchAiMatches = async () => {
    try {
      setLoading(true);
      // Calls the AI Controller we built
      const res = await axiosInstance.get("/dietician/match-ai"); 
      
      // The controller returns { data: [...] }
      setClients(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load matches. Is the AI service running?");
    } finally {
      setLoading(false);
    }
  };

  // 3. Filter Logic
  const filteredClients = clients.filter(client => 
    (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for Match Score Color
  const getScoreColor = (score: number = 0) => {
      if (score >= 80) return "#10b981"; // Green (High)
      if (score >= 50) return "#f59e0b"; // Orange (Medium)
      return "#ef4444"; // Red (Low)
  };

  if (loading) return (
    <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
      <div style={{ fontSize: "2rem", marginBottom: "20px" }}>🤖</div>
      <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i>
      <strong>AI is analyzing client profiles...</strong>
      <p style={{fontSize: "0.9rem", marginTop: "10px"}}>Finding the best matches for your specialization.</p>
    </div>
  );

  return (
    <div className="dietician-clients-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "15px", display: 'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h1 style={{ color: "#2c3e50", margin: "0 0 10px 0", display:'flex', alignItems:'center', gap:'10px' }}>
                <FaRobot style={{color: '#8b5cf6'}} /> Smart Client Matching
            </h1>
            <p style={{ color: "#7f8c8d", margin: 0 }}>AI-ranked opportunities based on your clinical specialization.</p>
        </div>
        <button 
            onClick={fetchAiMatches}
            style={{ padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
            ↻ Refresh Analysis
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "30px", position: "relative", maxWidth: "500px" }}>
        <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#95a5a6" }} />
        <input
          type="text"
          placeholder="Filter matches..."
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

      {error && (
        <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Client Cards Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
        gap: "25px" 
      }}>
        {filteredClients.map((client) => (
          <div key={client.user_id} style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            border: "1px solid #f1f2f6",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: 'relative'
          }}>
            
            {/* MATCH BADGE */}
            {client.match_score && (
                <div style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: getScoreColor(client.match_score),
                    color: 'white', padding: '5px 10px', borderRadius: '20px',
                    fontWeight: 'bold', fontSize: '0.85rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {client.match_score}% Match
                </div>
            )}

            <div style={{ padding: "20px" }}>
                {/* 1. Header: Avatar & Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                <img 
                    src={`https://ui-avatars.com/api/?name=${client.name}&background=random&color=fff&size=128`} 
                    alt={client.name}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                    <h3 style={{ margin: "0", fontSize: "1.15rem", color: "#2c3e50" }}>{client.name}</h3>
                    <span style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>{client.location || "Remote"}</span>
                </div>
                </div>

                {/* 2. AI Reasoning Box */}
                {client.match_reason && (
                    <div style={{
                        background: '#f0f9ff', borderLeft: '4px solid #3b82f6',
                        padding: '10px', fontSize: '0.9rem', color: '#1e3a8a',
                        marginBottom: '15px', borderRadius: '4px'
                    }}>
                        <strong>💡 Why:</strong> {client.match_reason}
                    </div>
                )}

                <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "15px 0" }} />

                {/* 3. Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem", color: "#555" }}>
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <FaBullseye style={{color:'#10b981'}} /> {client.weight_goal || "Wellness"}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <FaVenusMars style={{color:'#6366f1'}} /> {client.gender || "N/A"}, {client.age || "?"}
                    </div>
                    {/* Health Conditions Tag */}
                    {client.health_conditions && client.health_conditions.length > 0 && (
                        <div style={{ gridColumn: '1 / -1', marginTop:'5px' }}>
                            <FaExclamationCircle style={{color:'#ef4444', marginRight:'5px'}} />
                            <span style={{color:'#ef4444', fontWeight:'500'}}>
                                {Array.isArray(client.health_conditions) 
                                    ? client.health_conditions.join(", ") 
                                    : client.health_conditions}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Action Button */}
            <button style={{
              marginTop: "auto",
              padding: "15px",
              background: "#f8fafc",
              borderTop: "1px solid #eee",
              color: "#3498db",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
              textAlign: "center",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
            onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}
            >
              Send Proposal ➜
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}