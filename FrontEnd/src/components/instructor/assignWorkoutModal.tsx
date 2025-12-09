import React, { useState } from "react";
import "../../styles/instructor.css";

// ----------------------------------------------------------------------
// 1. Interfaces (Simplified and Updated)
// ----------------------------------------------------------------------

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
    // The previous props (selectedClientId, setSelectedClientId, confirmAssign) are replaced:
    // We now pass a single handler that takes the batch details.
  onAssign: (workoutId: number, clientIds: number[], status: string, notes: string) => Promise<void>;
}

// ----------------------------------------------------------------------
// 2. Component Implementation (Batch Assignment Logic)
// ----------------------------------------------------------------------

const AssignWorkoutModal: React.FC<AssignWorkoutModalProps> = ({
    isOpen,
    onClose,
    clients,
    selectedWorkout,
    onAssign, // The new batch assignment handler
}) => {
    // State managed internally by the modal
    const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
    const [status, setStatus] = useState<string>("scheduled");
    const [notes, setNotes] = useState<string>("Initial weekly program.");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clear internal state when modal closes
    React.useEffect(() => {
        if (isOpen) {
            setSelectedClientIds([]);
            setStatus("scheduled");
            setNotes("Initial weekly program.");
        }
    }, [isOpen]);


    if (!isOpen || !selectedWorkout) return null;

    // Handler for the client checkboxes
    const handleClientToggle = (clientId: number) => {
        setSelectedClientIds(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId) // Deselect
                : [...prev, clientId]                // Select
        );
    };

    // Handler for submission (calls the parent's batch assignment function)
    const handleConfirm = async () => {
        if (selectedClientIds.length === 0) {
            alert("Please select at least one client to assign the workout to.");
            return;
        }
        
        if (typeof onAssign !== 'function') {
        console.error("onAssign prop is missing or not a function.");
        alert("Error: Assignment function missing. Please try again or refresh.");
        return;
    }
        setIsSubmitting(true);

        try {
            await onAssign(
                selectedWorkout.workout_id,
                selectedClientIds,
                status,
                notes
            );
            
            // Note: The parent component now handles the success/failure alert
            // We just close the modal on successful attempt (results processed by parent)
            onClose(); 

        } catch (error) {
            // Error logged by parent, but we handle the submission state here
            console.error("Assignment failed:", error);
            alert("An error occurred during assignment. See console for details.");

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay1">
            <div className="modal-content1"> {/* Changed from 'modal' to 'modal-content' for consistency */}
                <h2>Assign Workout</h2>
                <p>
                    Workout: <strong>{selectedWorkout.title}</strong>
                </p>
                
                {/* ----------------- Status and Notes Fields ----------------- */}
                <div className="form-group">
                    <label htmlFor="status">Assignment Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending Review</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notes for Client</label>
                    <textarea 
                        id="notes" 
                        rows={3} 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="e.g., Do this for 6 weeks. Focus on form over weight."
                    />
                </div>

                {/* ----------------- Client Selection Checkboxes ----------------- */}
                <div className="client-list-scroll">
                    <h4>Clients ({selectedClientIds.length} selected)</h4>
                    {/* Filter out clients who don't have a user_id or clients array is empty */}
                    {Array.isArray(clients) && clients.length > 0 ? (
                        clients.map(client => (
                            <div key={client.user_id} className="client-item">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={selectedClientIds.includes(client.user_id)}
                                        onChange={() => handleClientToggle(client.user_id)}
                                    />
                                    <span className="checkmark"></span>
                                    {client.name} ({client.email})
                                </label>
                            </div>
                        ))
                    ) : (
                        <p>No clients available to assign this workout.</p>
                    )}
                </div>

                {/* ----------------- Actions ----------------- */}
                <div className="modal-actions1">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleConfirm} 
                        disabled={isSubmitting || selectedClientIds.length === 0}
                    >
                        {isSubmitting ? 'Assigning...' : `Assign to ${selectedClientIds.length} Client(s)`}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignWorkoutModal;