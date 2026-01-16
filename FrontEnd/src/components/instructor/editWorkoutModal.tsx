import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import type { Workout, PlanItem } from "../../types/workout"; 
import "../../styles/editModal.css"; // ✅ Import the new CSS

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  onSave: (updatedWorkout: Workout) => void;
}

const EditWorkoutModal: React.FC<Props> = ({ isOpen, onClose, workout, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // ✅ New State
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load workout details when modal opens
  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setDescription(workout.description);
      setVideoUrl(workout.video_url || ""); // ✅ Load existing video URL
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
    setIsSaving(true);

    const updatedWorkoutData = {
      title,
      description,
      video_url: videoUrl, // ✅ Include in payload
      plan,
    };

    try {
      // ✅ Using axiosInstance for consistency
      const res = await axiosInstance.put(`/workout/${workout.workout_id}`, updatedWorkoutData);

      if (res.status === 200) {
        // Construct full object to update parent state immediately
        const fullUpdatedObject: Workout = { 
            ...workout, 
            ...updatedWorkoutData 
        };
        onSave(fullUpdatedObject);
        onClose();
      }
    } catch (err) {
      console.error("Error updating workout:", err);
      alert("Failed to update workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !workout) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        
        {/* Header */}
        <div className="edit-modal-header">
          <h2>Edit Workout</h2>
          <button className="btn-remove-item" onClick={onClose} style={{background: 'transparent', color: '#666', fontSize: '1.2rem'}}>✕</button>
        </div>

        {/* Scrollable Body */}
        <div className="edit-modal-body">
          
          <div className="form-group">
            <label>Workout Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High Intensity Cardio"
            />
          </div>

          <div className="form-group">
            <label>Video URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the workout goals..."
            />
          </div>

          <div className="form-group">
            <label>Exercise Plan</label>
            <div className="plan-section">
              {plan.length === 0 && <p style={{color:'#888', textAlign:'center', fontSize:'0.9rem'}}>No exercises added yet.</p>}
              
              {plan.map((item, index) => (
                <div key={index} className="plan-item-row">
                  {/* Exercise Name */}
                  <input
                    className="plan-input"
                    type="text"
                    value={item.exercise}
                    onChange={(e) => handlePlanChange(index, "exercise", e.target.value)}
                    placeholder="Exercise Name"
                  />
                  {/* Sets */}
                  <input
                    className="plan-input"
                    type="number"
                    value={item.sets || ""}
                    onChange={(e) => handlePlanChange(index, "sets", Number(e.target.value))}
                    placeholder="Sets"
                  />
                  {/* Reps */}
                  <input
                    className="plan-input"
                    type="number"
                    value={item.reps || ""}
                    onChange={(e) => handlePlanChange(index, "reps", Number(e.target.value))}
                    placeholder="Reps"
                  />
                  {/* Duration */}
                  <input
                    className="plan-input"
                    type="text"
                    value={item.duration || ""}
                    onChange={(e) => handlePlanChange(index, "duration", e.target.value)}
                    placeholder="Dur (30s)"
                  />
                  {/* Delete Button */}
                  <button className="btn-remove-item" onClick={() => removePlanItem(index)} title="Remove Exercise">
                    ✕
                  </button>
                </div>
              ))}

              <button className="btn-add-exercise" onClick={addPlanItem}>
                + Add Exercise
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="edit-modal-footer">
          <button className="btn-cancel-modal" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn-save-modal" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditWorkoutModal;