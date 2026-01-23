import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaComments, FaUserPlus, FaChartLine, FaUser } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance"; 
import ClientProfileModal from "../../clientViewModal"; 
import "../../../styles/clientView.css"; 

import type { Client } from "../../../Services/clientViewService";

// Extend Client Type
interface DieticianClientView extends Client {
  match_score?: number;
  match_reason?: string;
  match_reasons?: string[];
  is_hired?: boolean;
}

type ViewMode = 'recommended' | 'leads' | 'hired';

const DieticianClients: React.FC = () => {
  const [clients, setClients] = useState<DieticianClientView[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DieticianClientView | null>(null);
  
  const navigate = useNavigate();

  // ✅ FIX 1: Get viewMode from URL params, default to 'recommended'
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
        case 'hired':       endpoint = "/dieticianClients/roster"; break;
      }

      const res = await axiosInstance.get(endpoint);
      setClients(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIX 1: Update URL when changing view mode
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
      alert("Could not start chat.");
    }
  };

  const handleHire = async (client: DieticianClientView) => {
    if(!window.confirm(`Add ${client.name} to your official Dietician Roster?`)) return;

    try {
      await axiosInstance.post("/dieticianClients/hire", { client_user_id: client.user_id });
      alert(`${client.name} has been added to your roster!`);
      
      // ✅ FIX 2: Update the local state immediately
      setClients(prevClients => 
        prevClients.map(c => 
          c.user_id === client.user_id 
            ? { ...c, is_hired: true } 
            : c
        )
      );
      
      // Optional: Also refresh from server to ensure data consistency
      // fetchClients();
      
    } catch (err) {
      console.error(err);
      alert("Failed to hire client.");
    }
  };

  return (
    <div className="clients-page" style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      
      {/* Header & Tabs */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <h1 style={{margin:0, color:'#2c3e50'}}>Manage Clients</h1>
        
        <div className="view-toggles" style={{display:'flex', background:'#f3f4f6', padding:'5px', borderRadius:'8px'}}>
            {(['recommended', 'leads', 'hired'] as ViewMode[]).map((mode) => (
                <button 
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    style={{
                        padding:'10px 20px', border:'none', borderRadius:'6px', cursor:'pointer',
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

      {/* Loading State */}
      {isLoading ? (
        <div style={{textAlign:'center', padding:'50px', color:'#999'}}>
          <div style={{fontSize:'1.2rem'}}>Loading...</div>
        </div>
      ) : (
        <div className="clients-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px'}}>
            
            {clients.length === 0 ? (
                <div style={{gridColumn:'1/-1', textAlign:'center', color:'#999', padding:'40px'}}>
                    {viewMode === 'recommended' && "No AI recommendations found yet."}
                    {viewMode === 'leads' && "Start chatting with recommended clients to see them here."}
                    {viewMode === 'hired' && "Your roster is empty."}
                </div>
            ) : (
                clients.map(client => (
                    <div key={client.user_id} className="client-card" style={{
                        background:'white', borderRadius:'12px', padding:'20px',
                        border:'1px solid #e5e7eb', display:'flex', flexDirection:'column', gap:'15px',
                        boxShadow:'0 4px 6px rgba(0,0,0,0.02)',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'}
                    >
                        
                        {/* Header */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                            <div>
                                <h3 style={{margin:0, fontSize:'1.1rem'}}>{client.name}</h3>
                                <span style={{fontSize:'0.85rem', color:'#666'}}>📍 {client.location || 'Remote'}</span>
                            </div>
                            
                            {/* AI Score Badge - ONLY for Recommended */}
                            {viewMode === 'recommended' && client.match_score && (
                                <span style={{
                                    background:'#ecfdf5', color:'#059669', padding:'4px 8px', 
                                    borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'
                                }}>
                                    {client.match_score}% MATCH
                                </span>
                            )}
                            
                            {/* Hired Badge for Leads */}
                            {viewMode === 'leads' && client.is_hired && (
                                <span style={{
                                    background:'#ecfdf5', color:'#059669', padding:'4px 8px', 
                                    borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'
                                }}>
                                    ✓ IN ROSTER
                                </span>
                            )}
                            
                            {/* Active Badge for Hired Tab */}
                            {viewMode === 'hired' && (
                                <span style={{
                                    background:'#eff6ff', color:'#2563eb', padding:'4px 8px', 
                                    borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'
                                }}>
                                    ACTIVE
                                </span>
                            )}
                        </div>

                        {/* AI Reason */}
                        {viewMode === 'recommended' && client.match_reason && (
                            <div style={{background:'#f9fafb', padding:'10px', borderRadius:'8px', fontSize:'0.85rem', color:'#555', lineHeight:'1.4'}}>
                                💡 {client.match_reason}
                            </div>
                        )}

                        {/* Stats */}
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#444'}}>
                            <div>Goal: <b>{client.weight_goal || 'Health'}</b></div>
                            <div>Age: <b>{client.age || 'N/A'}</b></div>
                        </div>

                        {/* Button Logic */}
                        <div style={{display:'flex', gap:'10px', marginTop:'auto'}}>
                            
                            {/* 1. RECOMMENDED TAB: Profile + Chat */}
                            {viewMode === 'recommended' && (
                                <>
                                    <button 
                                        onClick={() => setSelectedClient(client)}
                                        style={{ 
                                            flex:1, 
                                            padding:'10px', 
                                            borderRadius:'6px', 
                                            border:'1px solid #e5e7eb', 
                                            background:'#f3f4f6', 
                                            cursor:'pointer', 
                                            display:'flex', 
                                            alignItems:'center', 
                                            justifyContent:'center', 
                                            gap:'5px',
                                            transition: 'all 0.2s',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e5e7eb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f3f4f6';
                                        }}
                                    >
                                        <FaUser /> Profile
                                    </button>
                                    <button 
                                        onClick={() => handleChat(client.user_id)}
                                        style={{ 
                                            flex:1, 
                                            padding:'10px', 
                                            borderRadius:'6px', 
                                            border:'1px solid #e5e7eb', 
                                            background:'white', 
                                            cursor:'pointer', 
                                            display:'flex', 
                                            alignItems:'center', 
                                            justifyContent:'center', 
                                            gap:'5px',
                                            transition: 'all 0.2s',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        <FaComments /> Chat
                                    </button>
                                </>
                            )}

                            {/* 2. LEADS TAB: Chat + Hire/Hired Status */}
                            {viewMode === 'leads' && (
                                <>
                                    <button 
                                        onClick={() => handleChat(client.user_id)}
                                        style={{ 
                                            flex: 1, 
                                            padding: '10px', 
                                            borderRadius: '6px', 
                                            border: '1px solid #e5e7eb', 
                                            background: 'white', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '5px',
                                            transition: 'all 0.2s',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        <FaComments /> Chat
                                    </button>
                                    
                                    {/* ✅ Conditional: Show "Hired" badge or "Hire" button */}
                                    {client.is_hired ? (
                                        <div 
                                            style={{ 
                                                flex: 1, 
                                                padding: '10px', 
                                                borderRadius: '6px', 
                                                border: '2px solid #10b981', 
                                                background: '#ecfdf5', 
                                                color: '#059669', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '5px',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            ✓ Hired
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleHire(client)}
                                            style={{ 
                                                flex: 1, 
                                                padding: '10px', 
                                                borderRadius: '6px', 
                                                border: 'none', 
                                                background: '#10b981', 
                                                color: 'white', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '5px',
                                                transition: 'background 0.2s',
                                                fontWeight: '500'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                                        >
                                            <FaUserPlus /> Hire
                                        </button>
                                    )}
                                </>
                            )}

                            {/* 3. HIRED TAB: Chat + Progress */}
                            {viewMode === 'hired' && (
                                <>
                                    <button 
                                        onClick={() => handleChat(client.user_id)}
                                        style={{ 
                                            flex:1, 
                                            padding:'10px', 
                                            borderRadius:'6px', 
                                            border:'1px solid #e5e7eb', 
                                            background:'white', 
                                            cursor:'pointer', 
                                            display:'flex', 
                                            alignItems:'center', 
                                            justifyContent:'center', 
                                            gap:'5px',
                                            transition: 'all 0.2s',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        <FaComments /> Chat
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/dieticianClients/client-progress/${client.user_id}`)}
                                        style={{ 
                                            flex:1, 
                                            padding:'10px', 
                                            borderRadius:'6px', 
                                            border:'none', 
                                            background:'#3b82f6', 
                                            color:'white', 
                                            cursor:'pointer', 
                                            display:'flex', 
                                            alignItems:'center', 
                                            justifyContent:'center', 
                                            gap:'5px',
                                            transition: 'background 0.2s',
                                            fontWeight: '500'
                                        }}
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