import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; 
import ClientProfileModal from "./clientViewModal";
import "../styles/clientView.css";

// Import the unified type from the service
import type { Client } from "../Services/clientViewService";

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  
  // Toggles
  const [showMatchedOnly, setShowMatchedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  // Get user role
  const userRole = localStorage.getItem("userRole");

  // Load clients whenever the toggle changes
  useEffect(() => {
    fetchData();
  }, [showMatchedOnly]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/client"; 
      
      // If Instructor wants matches, switch endpoint
      if (showMatchedOnly && userRole === "Instructor") {
        endpoint = "/client/matches";
      }

      const response = await axiosInstance.get(endpoint);
      
      // Handle different response structures
      const data = response.data.data || response.data.clients || response.data;
      
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side Search Filtering
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


  // Navigation Logic
  const handleBackNavigation = () => {
    if (userRole === "Instructor") navigate("/instructor");
    else if (userRole === "Dietician") navigate("/dietician");
    else navigate("/clientsView");
  };

  // ✅ HANDLER: Start Chat with Client
 const handleMessageClick = async (targetUserId: number) => {
  try {
    const response = await axiosInstance.post("/messages/start", {
      client_id: targetUserId  
    });

    const { conversationId } = response.data;
    if (conversationId) {
      navigate(`/messages/${conversationId}`);
    }
  } catch (error) {
    console.error("Failed to start chat:", error);
    alert("Unable to open chat. Please try again.");
  }
};

  return (
    <div className="clients-page">
      <button className="back-btn" onClick={handleBackNavigation}>
        ← Back to Dashboard
      </button>

      <div className="header-flex">
          <h1 className="page-title">
            {showMatchedOnly ? "Recommended Clients" : "Client Directory"}
          </h1>
          
          {/* Toggle Switch for Instructors */}
          {userRole === "Instructor" && (
             <div className="toggle-container">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={showMatchedOnly} 
                    onChange={() => setShowMatchedOnly(!showMatchedOnly)} 
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">Show Smart Matches</span>
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
         <div className="loading">
             <div className="spinner"></div>
             <p>Finding best matches...</p>
         </div>
      ) : (
         <div className="clients-grid">
           {filteredClients.length > 0 ? (
             filteredClients.map((client) => (
               <div key={client.user_id} className={`client-card ${client.match_score ? 'matched-card' : ''}`}>
                 
                 {/* Match Badge */}
                 {showMatchedOnly && client.match_score && (
                    <div className="match-score-badge">
                        {client.match_score}% MATCH
                    </div>
                 )}

                 <div className="client-header">
                   <h3>{client.name}</h3>
                   <div className="client-location">📍 {client.location}</div>
                 </div>

                 {/* AI Insight Box */}
                 {showMatchedOnly && client.match_reasons && (
                    <div className="match-reasons">
                        {client.match_reasons.map((reason, i) => (
                            <div key={i} className="ai-message">
                                <span>💡</span>
                                <span>{reason}</span>
                            </div>
                        ))}
                    </div>
                 )}

                 {/* Info Grid */}
                 <div className="client-info">
                   <div className="info-item">
                     <label>Goal</label>
                     <span>{client.weight_goal || "Not specified"}</span>
                   </div>
                   <div className="info-item">
                     <label>Age</label>
                     <span>{client.age || "N/A"}</span>
                   </div>
                   <div className="info-item">
                     <label>Budget</label>
                     <span>{client.budget ? `$${client.budget}` : "Negotiable"}</span>
                   </div>
                   <div className="info-item">
                     <label>Gender</label>
                     <span>{client.gender}</span>
                   </div>
                 </div>

                 <div className="card-actions">
                   <button className="btn-profile" onClick={() => setSelectedClient(client)}>
                     View Profile
                   </button>
                   
                   {/* ✅ REPLACED: Email button with Message Button */}
                   <button
                     className="btn-contact"
                     onClick={() => handleMessageClick(client.user_id)}
                   >
                     Message 💬
                   </button>
                 </div>
               </div>
             ))
           ) : (
             <p className="no-results">No clients found matching your criteria.</p>
           )}
         </div>
      )}

      {selectedClient && (
        <ClientProfileModal 
            client={selectedClient} 
            onClose={() => setSelectedClient(null)} 
        />
      )}
    </div>
  );
};

export default ClientsPage;