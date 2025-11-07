import React from "react";
import type { Client } from "../Services/clientViewService";
import "./../styles/clientView.css";

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{client.name}</h2>
        <p className="modal-subtitle">{client.email}</p>

        <div className="modal-details">
          <p><strong>Age:</strong> {client.age}</p>
          <p><strong>Gender:</strong> {client.gender}</p>
          <p><strong>Goal:</strong> {client.weight_goal}</p>
          <p><strong>Height:</strong> {client.height} cm</p>
          <p><strong>Weight:</strong> {client.weight} kg</p>
          <p><strong>Allergies:</strong> {client.allergies || "None"}</p>
          <p><strong>Location:</strong> {client.location}</p>
          <p><strong>Budget:</strong> ${client.budget}</p>
        </div>

        <div className="modal-actions">
          <button
            className="btn-profile"
            onClick={() => window.open(`mailto:${client.email}`, "_blank")}
          >
            Email Client
          </button>
          <button
            className="btn-contact"
            onClick={() => alert("Chat feature coming soon!")}
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;
