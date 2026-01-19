import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; 
import ClientProfileModal from "./clientViewModal";
import "../styles/clientView.css";

import type { Client } from "../Services/clientViewService";

// Define View Modes
type ViewMode = 'recommended' | 'leads' | 'hired';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  
  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('recommended');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  // Fetch data whenever viewMode changes
  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/client"; // Default (Directory)

      if (userRole === "Instructor") {
        if (viewMode === 'recommended') endpoint = "/client/matches";
        if (viewMode === 'leads') endpoint = "/instructorClients/leads";
        if (viewMode === 'hired') endpoint = "/instructorClients/my-clients";
      }

      const response = await axiosInstance.get(endpoint);
      
      const data = response.data.data || response.data.clients || response.data;
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    let result = clients;
    if (search.trim()) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredClients(result);
  }, [search, clients]);

  const handleBackNavigation = () => {
    if (userRole === "Instructor") navigate("/instructor");
    else navigate("/clientsView");
  };

  // ✅ ACTION: Start/Continue Chat
  const handleMessageClick = async (targetUserId: number) => {
    try {
      const response = await axiosInstance.post("/messages/start", {
         instructor_id: targetUserId 
      });
      const { conversationId } = response.data;
      if (conversationId) navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("Unable to open chat.");
    }
  };

  // ✅ ACTION: Hire Client
  const handleHireClick = async (clientName: string, clientId: number) => {
    if(!window.confirm(`Are you sure you want to add ${clientName} to your official roster?`)) return;

    try {
      await axiosInstance.post("/instructorClients/hire", {
         client_id: clientId
      });
      
      alert(`Success! ${clientName} is now a client.`);
      fetchData(); 
    } catch (error) {
      console.error("Failed to hire client:", error);
      alert("Could not hire client. They might already be in your roster.");
    }
  };

  return (
    <div className="clients-page">
      <button className="back-btn" onClick={handleBackNavigation}>
        ← Back to Dashboard
      </button>

      <div className="header-flex">
          <h1 className="page-title">
            {viewMode === 'recommended' && "Recommended Clients"}
            {viewMode === 'leads' && "My Leads (Conversations)"}
            {viewMode === 'hired' && "My Roster (Hired)"}
          </h1>
          
          {userRole === "Instructor" && (
             <div className="view-toggles">
                <button 
                    className={`tab-btn ${viewMode === 'recommended' ? 'active' : ''}`}
                    onClick={() => setViewMode('recommended')}
                >
                    Recommended
                </button>
                <button 
                    className={`tab-btn ${viewMode === 'leads' ? 'active' : ''}`}
                    onClick={() => setViewMode('leads')}
                >
                    Leads 💬
                </button>
                <button 
                    className={`tab-btn ${viewMode === 'hired' ? 'active' : ''}`}
                    onClick={() => setViewMode('hired')}
                >
                    Hired ✅
                </button>
             </div>
          )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
         <div className="loading"><div className="spinner"></div></div>
      ) : (
         <div className="clients-grid">
           {filteredClients.length > 0 ? (
             filteredClients.map((client) => (
               <div key={client.user_id} className={`client-card ${viewMode === 'hired' ? 'hired-card' : ''}`}>
                 
                 {/* Badges */}
                 {viewMode === 'recommended' && client.match_score && (
                    <div className="match-score-badge">{client.match_score}% MATCH</div>
                 )}
                 {viewMode === 'hired' && (
                    <div className="match-score-badge" style={{background: '#2563eb'}}>ACTIVE CLIENT</div>
                 )}

                 <div className="client-header">
                   <h3>{client.name}</h3>
                   <div className="client-location">📍 {client.location || "Remote"}</div>
                 </div>

                 {/* AI Insights (Only on Recommended) */}
                 {viewMode === 'recommended' && client.match_reasons && (
                    <div className="match-reasons">
                        {client.match_reasons.map((reason, i) => (
                            <div key={i} className="ai-message"><span>💡</span><span>{reason}</span></div>
                        ))}
                    </div>
                 )}

                 <div className="client-info">
                   <div className="info-item">
                     <label>Goal</label><span>{client.weight_goal || "N/A"}</span>
                   </div>
                   <div className="info-item">
                     <label>Age</label><span>{client.age || "N/A"}</span>
                   </div>
                   <div className="info-item">
                     <label>Budget</label><span>{client.budget ? `$${client.budget}` : "-"}</span>
                   </div>
                 </div>

                 <div className="card-actions">
                   <button className="btn-profile" onClick={() => setSelectedClient(client)}>
                     Profile
                   </button>
                   
                   {/* ✅ DYNAMIC ACTION BUTTONS */}
                   
                   {/* 1. LEADS TAB: Chat + Hire */}
                   {viewMode === 'leads' && (
                     <div style={{display: 'flex', gap: '5px', flex: 1}}>
                        <button 
                            className="btn-contact"
                            style={{ flex: 1, borderColor: '#ccc', color: '#666' }}
                            onClick={() => handleMessageClick(client.user_id)}
                        >
                            Chat
                        </button>
                        <button 
                            className="btn-contact"
                            style={{ flex: 2, background: '#16a34a', color: 'white', borderColor: '#16a34a' }}
                            onClick={() => handleHireClick(client.name, client.user_id)}
                        >
                            Hire +
                        </button>
                     </div>
                   )}

                   {/* 2. HIRED TAB: Chat + Progress (The New Update) */}
                   {viewMode === 'hired' && (
                     <div style={{display: 'flex', gap: '5px', flex: 1}}>
                        <button 
                            className="btn-contact"
                            style={{ flex: 1, borderColor: '#ccc', color: '#333' }}
                            onClick={() => handleMessageClick(client.user_id)}
                        >
                            Chat 💬
                        </button>
                        <button 
                            className="btn-contact"
                            style={{ flex: 1.5, background: '#2563eb', color: 'white', borderColor: '#2563eb' }}
                            onClick={() => navigate(`/instructor/client-progress/${client.user_id}`)}
                        >
                            📈 Progress
                        </button>
                     </div>
                   )}

                   {/* 3. RECOMMENDED TAB: Message Only */}
                   {viewMode === 'recommended' && (
                     <button 
                        className="btn-contact" 
                        onClick={() => handleMessageClick(client.user_id)}
                     >
                        Message
                     </button>
                   )}

                 </div>
               </div>
             ))
           ) : (
             <p className="no-results">
                {viewMode === 'leads' 
                    ? "You haven't started chatting with any potential clients yet." 
                    : viewMode === 'hired' 
                        ? "Your roster is empty."
                        : "No recommendations found."}
             </p>
           )}
         </div>
      )}

      {selectedClient && (
        <ClientProfileModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};

export default ClientsPage;