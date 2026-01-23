import { useState, useEffect } from "react";
import { 
  FaUserMd, 
  FaStar, 
  FaCommentDots, 
  FaSearch, 
  FaMapMarkerAlt,
  FaAward 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

// Define what a Dietician looks like
interface DieticianData {
  user_id: number;
  dietician_id: number;
  name: string;
  specialization: string;
  location?: string;
  rating?: number;
  bio?: string;
  match_score?: number; // AI Score
  experience_years?: number;
}

export default function ClientDieticians() {
  const [dieticians, setDieticians] = useState<DieticianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDieticianMatches();
  }, []);

  const fetchDieticianMatches = async () => {
    try {
      setLoading(true);
      // NOTE: Ensure this endpoint exists in your backend or use '/dietician' to get all
      const res = await axiosInstance.get("/matchedDietician/match-dietician"); 
      setDieticians(res.data.data || res.data); // Handle {data: []} or []
    } catch (err) {
      console.error("Error fetching dieticians:", err);
      // Fallback data for demo if backend is empty
      // setDieticians([]); 
    } finally {
      setLoading(false);
    }
  };

  // ✅ THE CHAT HANDLER (Same generic logic)
  const handleStartChat = async (targetUserId: number) => {
    try {
      // 1. Create/Get Conversation ID
      const res = await axiosInstance.post('/messages/start', {
        target_user_id: targetUserId
      });
      
      const { conversationId } = res.data;

      // 2. Redirect to Inbox
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Failed to start chat", err);
      alert("Could not start chat. Please try again.");
    }
  };

  const filteredList = dieticians.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Finding best dieticians for you...</div>;

  return (
    <div className="client-dieticians-page" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "30px", borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h1 style={{ display:'flex', alignItems:'center', gap:'10px', color:'#2c3e50', margin:0 }}>
            <FaUserMd style={{color:'#10b981'}} /> Find Your Dietician
        </h1>
        <p style={{ color: '#666', marginTop: '5px' }}>
          Professionals matched to your health goals.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "30px", position:'relative', maxWidth:'500px' }}>
        <FaSearch style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}} />
        <input 
            type="text" 
            placeholder="Search by name or specialization..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
                width:'100%', padding:'12px 12px 12px 45px', 
                borderRadius:'8px', border:'1px solid #e5e7eb', fontSize:'1rem'
            }}
        />
      </div>

      {/* Dietician Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" }}>
        
        {filteredList.length === 0 ? (
            <div style={{color:'#666'}}>No dieticians found.</div>
        ) : (
            filteredList.map((dietician) => (
            <div key={dietician.user_id} style={{
                background: "white", borderRadius: "12px", border: "1px solid #f3f4f6",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                
                <div style={{ padding: "20px" }}>
                    {/* Header: Avatar & Name */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom:'15px' }}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${dietician.name}&background=10b981&color=fff`} 
                            alt={dietician.name} 
                            style={{width:'60px', height:'60px', borderRadius:'50%'}}
                        />
                        <div>
                            <h3 style={{ margin: 0, color:'#1f2937', fontSize:'1.1rem' }}>{dietician.name}</h3>
                            <span style={{ color:'#10b981', fontWeight:'500', fontSize:'0.9rem' }}>
                                {dietician.specialization || "Nutrition Specialist"}
                            </span>
                        </div>
                        {dietician.rating && (
                            <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap:'4px', color:'#f59e0b', fontWeight:'bold' }}>
                                <FaStar /> {dietician.rating}
                            </div>
                        )}
                    </div>

                    {/* Bio / Details */}
                    <p style={{ color:'#4b5563', fontSize:'0.9rem', lineHeight:'1.5', marginBottom:'15px' }}>
                        {dietician.bio || `Experienced dietician specializing in personalized meal planning and ${dietician.specialization?.toLowerCase() || 'healthy living'}.`}
                    </p>

                    <div style={{ display:'flex', gap:'15px', fontSize:'0.85rem', color:'#6b7280' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                            <FaMapMarkerAlt /> {dietician.location || "Remote"}
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                            <FaAward /> {dietician.experience_years || 5}+ Years Exp
                        </div>
                    </div>
                </div>

                {/* ✅ MESSAGE BUTTON */}
                <button 
                onClick={() => handleStartChat(dietician.user_id)}
                style={{
                    marginTop: "auto", padding: "15px", 
                    background: "#f9fafb", border: "none", borderTop: "1px solid #e5e7eb",
                    color: "#2563eb", fontWeight: "600", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: 'background 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                >
                <FaCommentDots /> Message {dietician.name.split(' ')[0]}
                </button>
            </div>
            ))
        )}
      </div>
    </div>
  );
}