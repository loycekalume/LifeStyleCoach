import React from "react";
import type { Client } from "../Services/clientViewService";
import { FaTimes } from "react-icons/fa"; 
import "./../styles/clientView.css";

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, onClose }) => {
  
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    
    <div className="modal-backdrop" onClick={onClose}>
     
      <div className="modal-card" onClick={handleCardClick}>
        
        
        <button className="close-btn" onClick={onClose}>
            <FaTimes />
        </button>

        <div className="modal-header-content">
            <h2 className="modal-title">{client.name}</h2>
            <p className="modal-subtitle">{client.email}</p>
        </div>

        <div className="modal-details">
          <div className="detail-row"><strong>Age:</strong> <span>{client.age || "N/A"}</span></div>
          <div className="detail-row"><strong>Gender:</strong> <span>{client.gender || "N/A"}</span></div>
          <div className="detail-row"><strong>Goal:</strong> <span>{client.weight_goal || "N/A"}</span></div>
          <div className="detail-row"><strong>Height:</strong> <span>{client.height ? `${client.height} cm` : "N/A"}</span></div>
          <div className="detail-row"><strong>Weight:</strong> <span>{client.weight ? `${client.weight} kg` : "N/A"}</span></div>
          <div className="detail-row"><strong>Allergies:</strong> <span>{client.allergies || "None"}</span></div>
          <div className="detail-row"><strong>Location:</strong> <span>{client.location || "Remote"}</span></div>
          <div className="detail-row"><strong>Budget:</strong> <span>{client.budget ? `$${client.budget}` : "N/A"}</span></div>
        </div>

       
      </div>
    </div>
  );
};

export default ClientProfileModal;