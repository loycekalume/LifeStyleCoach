import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaBullseye, 
  FaVenusMars, 
  FaRobot, 
  FaExclamationCircle, 
  FaCommentDots 
} from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance";
import { useNavigate } from "react-router-dom"; 

interface ClientData {
  user_id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  location?: string;
  weight_goal?: string;
  match_score?: number;
  match_reason?: string;
  health_conditions?: string[] | string;
}

export default function DieticianClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(""); 
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAiMatches();
  }, []);

  const fetchAiMatches = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/dietician/match-ai"); 
      setClients(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (targetUserId: number) => {
      try {
          const res = await axiosInstance.post('/messages/start', {
              target_user_id: targetUserId
          });
          const conversationId = res.data.conversationId;
          navigate(`/messages/${conversationId}`);
      } catch (err) {
          console.error("Chat start error", err);
          alert("Could not start chat. Please try again.");
      }
  };

  const filteredClients = clients.filter(client => 
    (client.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number = 0) => {
      if (score >= 80) return "#10b981"; 
      if (score >= 50) return "#f59e0b"; 
      return "#ef4444"; 
  };

  if (loading) return (
    <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
        Loading AI Matches...
    </div>
  );

  return (
    <div className="dietician-clients-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "30px", borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{display:'flex', alignItems:'center', gap:'10px', color:'#2c3e50'}}>
            <FaRobot style={{color:'#8b5cf6'}}/> Smart Client Matching
        </h1>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "30px", position:'relative', maxWidth:'400px' }}>
        <FaSearch style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#999'}}/>
        <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width:'100%', padding:'10px 10px 10px 35px', borderRadius:'6px', border:'1px solid #ccc'}}
        />
      </div>

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

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
        {filteredClients.map((client) => (
          <div key={client.user_id} style={{
            background: "white", borderRadius: "12px", border: "1px solid #f1f2f6",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            display: "flex", flexDirection: "column", position: 'relative', overflow: 'hidden'
          }}>
            
            {/* Match Badge */}
            {client.match_score && (
                <div style={{
                    position: 'absolute', top: '15px', right: '15px',
                    background: getScoreColor(client.match_score),
                    color: 'white', padding: '5px 10px', borderRadius: '20px',
                    fontWeight: 'bold', fontSize: '0.75rem'
                }}>
                    {client.match_score}% Match
                </div>
            )}
            
            <div style={{ padding: "20px" }}>
                {/* Avatar & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <img 
                        src={`https://ui-avatars.com/api/?name=${client.name}&background=random&color=fff`} 
                        alt="Avatar" 
                        style={{width:'50px', height:'50px', borderRadius:'50%'}}
                    />
                    <div>
                        <h3 style={{margin:0, color:'#333'}}>{client.name}</h3>
                        <span style={{color:'#777', fontSize:'0.9rem'}}>{client.location || 'Remote'}</span>
                    </div>
                </div>

                {/* AI Reason */}
                {client.match_reason && (
                    <div style={{background:'#f0f9ff', padding:'10px', borderRadius:'6px', fontSize:'0.85rem', color:'#0369a1', marginBottom:'15px', borderLeft:'3px solid #0ea5e9'}}>
                        <strong>💡 AI Insight:</strong> {client.match_reason}
                    </div>
                )}

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#555' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaBullseye style={{color:'#10b981'}} /> {client.weight_goal || 'Wellness'}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaVenusMars style={{color:'#6366f1'}} /> {client.gender || 'N/A'}
                    </div>
                    {/* Health Conditions */}
                    {client.health_conditions && (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
                            <FaExclamationCircle /> 
                            {Array.isArray(client.health_conditions) ? client.health_conditions.join(', ') : client.health_conditions}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Button */}
            <button 
              onClick={() => handleStartChat(client.user_id)}
              style={{
                marginTop: "auto", padding: "15px", background: "#f8fafc",
                borderTop: "1px solid #eee", color: "#2563eb", border: "none",
                cursor: "pointer", fontWeight: "600", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              <FaCommentDots /> Chat with {client.name.split(" ")[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}