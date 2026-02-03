import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaComments, FaUserPlus, FaChartLine, FaUser } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance"; 
import ClientProfileModal from "../../clientViewModal"; 
import "../../../styles/clientView.css"; 

import type { Client } from "../../../Services/clientViewService";

// Extend Client Type to include matching/hiring info specific to this view
interface DieticianClientView extends Client {
  match_score?: number;
  match_reason?: string;
  match_reasons?: string[];
  is_accepted?: boolean;
}

type ViewMode = 'recommended' | 'leads' | 'accepted';

const DieticianClients: React.FC = () => {
  const [clients, setClients] = useState<DieticianClientView[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DieticianClientView | null>(null);
  
  const navigate = useNavigate();

  // Get viewMode from URL params, default to 'recommended'
  const viewMode = (searchParams.get('view') as ViewMode) || 'recommended';

  useEffect(() => {
    fetchClients();
  }, [viewMode]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      let endpoint = "";
      switch(viewMode) {
        case 'recommended': endpoint = "/dieticianClients/matches"; break;
        case 'leads':       endpoint = "/dieticianClients/leads"; break;
        case 'accepted':       endpoint = "/dieticianClients/roster"; break;
        default: endpoint = "/dieticianClients/matches";
      }

      const res = await axiosInstance.get(endpoint);
      // Handle data wrapped in { data: [...] } or direct array
      setClients(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setSearchParams({ view: mode });
  };

  const handleChat = async (targetUserId: number) => {
    try {
      const res = await axiosInstance.post("/messages/start", { target_user_id: targetUserId });
      if (res.data.conversationId) {
        navigate(`/messages/${res.data.conversationId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Could not start chat.");
    }
  };

  const handleHire = async (client: DieticianClientView) => {
    if(!window.confirm(`Add ${client.name} to your official Dietician Roster?`)) return;

    try {
      await axiosInstance.post("/dieticianClients/hire", { client_user_id: client.user_id });
      alert(`${client.name} has been added to your roster!`);
      
      // Update local state to reflect accepted status immediately
      setClients(prevClients => 
        prevClients.map(c => 
          c.user_id === client.user_id 
            ? { ...c, is_accepted: true } 
            : c
        )
      );
      
    } catch (err) {
      console.error(err);
      alert("Failed to accept client. Please try again.");
    }
  };

  // --- STYLES ---
  const btnSecondaryStyle: React.CSSProperties = {
    flex: '1', 
    minWidth: '80px', 
    padding: '10px 12px', 
    borderRadius: '6px', 
    border: '1px solid #e5e7eb', 
    background: 'white', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '6px', 
    transition: 'all 0.2s', 
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  const btnPrimaryStyle: React.CSSProperties = {
    flex: '1', 
    minWidth: '80px',
    padding: '10px 12px', 
    borderRadius: '6px', 
    border: 'none', 
    background: '#10b981', 
    color: 'white', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '6px', 
    transition: 'background 0.2s', 
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  const badgeacceptedStyle: React.CSSProperties = {
    flex: '1', 
    minWidth: '80px',
    padding: '10px 12px', 
    borderRadius: '6px', 
    border: '2px solid #10b981', 
    background: '#ecfdf5',
    color: '#059669', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '6px',
    fontWeight: 'bold', 
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="clients-page" style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      {/* Back Button */}
      <button 
        onClick={() => navigate("/dietician")}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', marginBottom: '20px', fontSize: '0.95rem',
            fontWeight: '600', padding: '0', transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#1f2937'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
      >
        ← Back to Dashboard
      </button>

      {/* Header & Tabs */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', flexWrap:'wrap', gap:'15px'}}>
        <h1 style={{margin:0, color:'#2c3e50'}}>Manage Clients</h1>
        
        <div className="view-toggles" style={{display:'flex', background:'#f3f4f6', padding:'5px', borderRadius:'8px'}}>
            {(['recommended', 'leads', 'accepted'] as ViewMode[]).map((mode) => (
                <button 
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    style={{
                        padding:'8px 16px', border:'none', borderRadius:'6px', cursor:'pointer',
                        fontWeight:'600', textTransform:'capitalize',
                        background: viewMode === mode ? 'white' : 'transparent',
                        color: viewMode === mode ? '#10b981' : '#6b7280',
                        boxShadow: viewMode === mode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {mode}
                </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div style={{textAlign:'center', padding:'50px', color:'#999'}}>
          <div className="spinner" style={{margin: '0 auto 10px'}}></div>
          <div style={{fontSize:'1.1rem'}}>Loading clients...</div>
        </div>
      ) : (
        <div className="clients-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px'}}>
            
            {clients.length === 0 ? (
                <div style={{gridColumn:'1/-1', textAlign:'center', color:'#999', padding:'60px', background:'#f9fafb', borderRadius:'12px'}}>
                    <div style={{fontSize:'2rem', marginBottom:'10px'}}>📭</div>
                    <p style={{fontSize:'1.1rem', fontWeight:'500'}}>
                        {viewMode === 'recommended' && "No AI matches found at the moment."}
                        {viewMode === 'leads' && "You haven't interacted with any clients yet."}
                        {viewMode === 'accepted' && "Your client roster is currently empty."}
                    </p>
                </div>
            ) : (
                clients.map(client => (
                    <div key={client.user_id} className="client-card" style={{
                        background:'white', borderRadius:'12px', padding:'20px',
                        border:'1px solid #e5e7eb', display:'flex', flexDirection:'column', gap:'15px',
                        boxShadow:'0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                    >
                        {/* Card Header */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                            <div>
                                <h3 style={{margin:0, fontSize:'1.1rem', color:'#1f2937'}}>{client.name}</h3>
                                <span style={{fontSize:'0.85rem', color:'#6b7280'}}>📍 {client.location || 'Remote'}</span>
                            </div>
                            
                            {/* Badges */}
                            {viewMode === 'recommended' && client.match_score && (
                                <span style={{ background:'#ecfdf5', color:'#059669', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold' }}>
                                    {client.match_score}% MATCH
                                </span>
                            )}
                            
                            {viewMode === 'leads' && client.is_accepted && (
                                <span style={{ background:'#ecfdf5', color:'#059669', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold' }}>
                                    ✓ IN ROSTER
                                </span>
                            )}
                            
                            {viewMode === 'accepted' && (
                                <span style={{ background:'#eff6ff', color:'#2563eb', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold' }}>
                                    ACTIVE
                                </span>
                            )}
                        </div>

                        {/* Match Reason */}
                        {viewMode === 'recommended' && client.match_reason && (
                            <div style={{background:'#f3f4f6', padding:'10px', borderRadius:'8px', fontSize:'0.85rem', color:'#4b5563', lineHeight:'1.4'}}>
                                💡 {client.match_reason}
                            </div>
                        )}

                        {/* Stats */}
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#4b5563', borderTop:'1px solid #f3f4f6', paddingTop:'10px'}}>
                            <div>Goal: <b>{client.weight_goal || 'Health'}</b></div>
                            <div>Age: <b>{client.age || 'N/A'}</b></div>
                        </div>

                        {/* Actions */}
                        <div style={{display:'flex', gap:'10px', marginTop:'auto'}}>
                            
                            {viewMode === 'recommended' && (
                                <>
                                    <button onClick={() => setSelectedClient(client)} style={btnSecondaryStyle}>
                                        <FaUser /> Profile
                                    </button>
                                    <button onClick={() => handleChat(client.user_id)} style={btnSecondaryStyle}>
                                        <FaComments /> Chat
                                    </button>
                                </>
                            )}

                            {viewMode === 'leads' && (
                                <>
                                    <button onClick={() => handleChat(client.user_id)} style={btnSecondaryStyle}>
                                        <FaComments /> Chat
                                    </button>
                                    {client.is_accepted ? (
                                        <div style={badgeacceptedStyle}>✓ Accepted</div>
                                    ) : (
                                        <button onClick={() => handleHire(client)} style={btnPrimaryStyle}>
                                            <FaUserPlus /> Accept
                                        </button>
                                    )}
                                </>
                            )}

                            {viewMode === 'accepted' && (
                                <>
                                    <button onClick={() => handleChat(client.user_id)} style={btnSecondaryStyle}>
                                        <FaComments /> Chat
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/dieticianClients/client-progress/${client.user_id}`)}
                                        style={{...btnPrimaryStyle, background: '#3b82f6'}}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                        <FaChartLine /> Progress
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      )}

      {selectedClient && (
        <ClientProfileModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};

export default DieticianClients;