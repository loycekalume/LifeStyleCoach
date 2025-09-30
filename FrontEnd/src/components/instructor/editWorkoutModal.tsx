import React, { useState, useEffect } from "react";
import type{ Workout, PlanItem } from "../../types/workout"; 
import "../../css/instructor.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  onSave: (updatedWorkout: Workout) => void;
}

const EditWorkoutModal: React.FC<Props> = ({ isOpen, onClose, workout, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState<PlanItem[]>([]);

  // Load workout details when modal opens
  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setDescription(workout.description);
      setPlan(workout.plan || []);
    }
  }, [workout]);

  const handlePlanChange = (index: number, field: keyof PlanItem, value: string | number) => {
    const updated = [...plan];
    updated[index] = { ...updated[index], [field]: value };
    setPlan(updated);
  };

  const addPlanItem = () => {
    setPlan([...plan, { exercise: "", sets: 0, reps: 0, duration: "" }]);
  };

  const removePlanItem = (index: number) => {
    setPlan(plan.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!workout) return;

    const updatedWorkout: Workout = {
      ...workout,
      title,
      description,
      plan,
    };

    try {
      const res = await fetch(`http://localhost:3000/workout/${workout.workout_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWorkout),
      });

      if (res.ok) {
        onSave(updatedWorkout);
        onClose();
      } else {
        console.error("Failed to update workout");
      }
    } catch (err) {
      console.error("Error updating workout:", err);
    }
  };

  if (!isOpen || !workout) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Workout</h2>

        <label>Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Workout title"
        />

        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Workout description"
        />

        <label>Plan:</label>
        <div className="plan-editor">
          {plan.map((item, index) => (
            <div key={index} className="plan-item">
              <input
                type="text"
                value={item.exercise}
                onChange={(e) => handlePlanChange(index, "exercise", e.target.value)}
                placeholder="Exercise"
              />
              <input
                type="number"
                value={item.sets || ""}
                onChange={(e) => handlePlanChange(index, "sets", Number(e.target.value))}
                placeholder="Sets"
              />
              <input
                type="number"
                value={item.reps || ""}
                onChange={(e) => handlePlanChange(index, "reps", Number(e.target.value))}
                placeholder="Reps"
              />
              <input
                type="text"
                value={item.duration || ""}
                onChange={(e) => handlePlanChange(index, "duration", e.target.value)}
                placeholder="Duration (e.g. 30s)"
              />
              <button className="btn-delete" onClick={() => removePlanItem(index)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <button className="btn-add" onClick={addPlanItem}>
          + Add Exercise
        </button>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWorkoutModal;
