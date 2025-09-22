import React, { useState } from "react";
import "../../css/instructor.css";

interface Workout {
  workout_id: number;
  title: string;
  description: string;
  plan: any;
}

interface WorkoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId?: number; 
}

const WorkoutsModal: React.FC<WorkoutsModalProps> = ({ isOpen, onClose, instructorId }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState(""); 

  
  const effectiveInstructorId = instructorId ?? 4;

  if (!isOpen) return null;

  const handleAddWorkout = async () => {
    if (!title.trim()) return;

    try {
      const response = await fetch("http://localhost:3000/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: effectiveInstructorId, 
          title,
          description,
          plan: plan ? JSON.parse(plan) : [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const newWorkout = await response.json();

      setWorkouts([...workouts, newWorkout]);
      setTitle("");
      setDescription("");
      setPlan("");
    } catch (error) {
      console.error("Error adding workout:", error);
      alert("Failed to add workout. Please check your plan JSON format.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Workout Plans</h2>

        {/* Form */}
        <div className="workout-form">
          <input
            type="text"
            placeholder="Workout Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Workout Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <textarea
            placeholder='Workout Plan (JSON, e.g. [{"exercise":"Push-ups","sets":3,"reps":15}])'
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          ></textarea>
          <button className="btn btn-primary" onClick={handleAddWorkout}>
            Add Workout
          </button>
        </div>

      

        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WorkoutsModal;
