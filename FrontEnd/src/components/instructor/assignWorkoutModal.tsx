import React from "react";
import "../../css/instructor.css";

interface Client {
  user_id: number;
  name: string;
  email: string;
}

interface Workout {
  workout_id: number;
  title: string;
  description: string;
}

interface AssignWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  selectedWorkout: Workout | null;
  selectedClientId: number | null;
  setSelectedClientId: (id: number | null) => void;
  confirmAssign: () => void;
}

const AssignWorkoutModal: React.FC<AssignWorkoutModalProps> = ({
  isOpen,
  onClose,
  clients,
  selectedWorkout,
  selectedClientId,
  setSelectedClientId,
  confirmAssign,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Assign Workout</h2>
        <p>
          Workout: <strong>{selectedWorkout?.title}</strong>
        </p>

        <select
          id="client-select"
          name="client"
          value={selectedClientId !== null ? String(selectedClientId) : ""}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedClientId(value ? Number(value) : null);
          }}
        >
          <option value="">-- Select Client --</option>
          {Array.isArray(clients) &&
            clients.map((client) => (
              <option key={client.user_id} value={client.user_id}>
                {client.name} ({client.email})
              </option>
            ))}
        </select>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={confirmAssign}>
            Confirm
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignWorkoutModal;
