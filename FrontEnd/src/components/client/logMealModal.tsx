import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface MealLogModalProps {
  open: boolean;          // ✅ Renamed from isOpen to match your Parent component
  onClose: () => void;
  onSuccess?: () => void; // Made optional, triggers data refresh
}

export default function MealLogModal({ open, onClose, onSuccess }: MealLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meal_type: "Breakfast",
    meal_name: "",
    portion_size: ""
  });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null; // ✅ Updated check

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Logic handled HERE inside the modal
      await axiosInstance.post('/meallogs/track', formData);
      
      if (onSuccess) onSuccess(); // Refresh parent data
      onClose();   // Close modal
      setFormData({ meal_type: "Breakfast", meal_name: "", portion_size: "" }); // Reset form
    } catch (err: any) {
      console.error("Logging error:", err);
      setError("Failed to log meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Log a Meal</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Meal Type */}
          <div className="form-group">
            <label>When?</label>
            <div className="meal-type-selector">
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`type-btn ${formData.meal_type === type ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, meal_type: type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Name */}
          <div className="form-group">
            <label>What did you eat?</label>
            <input
              type="text"
              placeholder="e.g. Ugali and Sukuma"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              required
            />
          </div>

          {/* Portion Size */}
          <div className="form-group">
            <label>Portion Size (helps AI calculate calories)</label>
            <input
              type="text"
              placeholder="e.g. 1 plate, 2 slices, 300g"
              value={formData.portion_size}
              onChange={(e) => setFormData({ ...formData, portion_size: e.target.value })}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Calculating...
                </>
              ) : (
                "Add Meal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}