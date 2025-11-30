import React, { useState } from "react";
import "../../styles/logMealModal.css";

interface LogMealModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (meal: { meal_time: string; description: string; calories: number }) => void;
}

const LogMealModal: React.FC<LogMealModalProps> = ({ open, onClose, onSubmit }) => {
  const [mealTime, setMealTime] = useState<"Breakfast" | "Lunch" | "Supper" | "">("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState<number | "">("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealTime || !description || !calories) {
      alert("Please fill in all fields");
      return;
    }

    onSubmit?.({
      meal_time: mealTime,
      description,
      calories: Number(calories),
    });

    // Reset fields after submission
    setMealTime("");
    setDescription("");
    setCalories("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Log a Meal</h2>
        <form onSubmit={handleSubmit} className="log-meal-form">
          <label>
            Meal Time:
            <select
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value as "Breakfast" | "Lunch" | "Supper")}
              required
            >
              <option value="">Select a meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Supper">Supper</option>
            </select>
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you eat?"
              required
            />
          </label>

          <label>
            Calories:
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : "")}
              placeholder="e.g. 350"
              required
            />
          </label>

          <button type="submit" className="submit-btn">Log Meal</button>
        </form>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LogMealModal;
