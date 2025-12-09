import React, { useState } from "react";
import "./bookSession.css";

interface BookSessionModalProps {
  open: boolean;
  onClose: () => void;
 onNavigate?: (page: "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress") => void;
}

const BookSessionModal: React.FC<BookSessionModalProps> = ({ open, onClose,onNavigate }) => {
  const [service, setService] = useState<"Dietician" | "Gym Instructor" | "">("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      alert("Please select a service!");
      return;
    }
    alert(`Session booked with a ${service}`); 
    onClose();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ Prevent overlay click interference
    onClose(); // ✅ Now it will close safely
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Book a Session</h2>
        <p>Select the type of session you want:</p>

        <div className="options">
          <button
            type="button"
            className={service === "Dietician" ? "active" : ""}
            onClick={(e) => { e.stopPropagation(); setService("Dietician") }}
          >

            <i className="fas fa-apple-alt"></i>
            <br />
            Dietician
          </button>

          <button
            type="button"
            className={service === "Gym Instructor" ? "active" : ""}
            onClick={(e) => { e.preventDefault(); onNavigate?.("instructors"); }}
          >
              <i className="fas fa-dumbbell mr-2"></i>
              <br />
            Gym Instructor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <button type="submit" className="submit-btn">Confirm</button>
        </form>

        <button
          type="button"
          className="close-btn"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookSessionModal;
