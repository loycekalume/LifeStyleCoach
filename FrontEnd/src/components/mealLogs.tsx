import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface MealFormProps {
  onClose: () => void;
}

export default function MealForm({ onClose }: MealFormProps) {
  const [formData, setFormData] = useState({
    meal_time: "",
    description: "",
    calories: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submittedData = { ...formData, calories: Number(formData.calories) };
    console.log("Submitted Data:", submittedData);
    alert(`Meal recorded for ${formData.meal_time}!`);
    setFormData({ meal_time: "", description: "", calories: "" });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: "fadeIn 0.3s ease-in-out",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "12px",
          padding: "25px 30px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
          animation: "slideUp 0.4s ease",
          color: "#333",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#222",
          }}
        >
          🍽️ Log Your Meal
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#444",
            }}
          >
            Meal Time
          </label>
          <input
            type="text"
            name="meal_time"
            value={formData.meal_time}
            onChange={handleChange}
            placeholder="e.g. Breakfast, Lunch, Dinner"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #007bff")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#444",
            }}
          >
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What did you eat?"
            rows={3}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              resize: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#444",
            }}
          >
            Calories
          </label>
          <input
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            placeholder="e.g. 450"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#007bff")}
          >
            Submit
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: "#e0e0e0",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ccc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e0e0e0")}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Add animation keyframes directly in a <style> tag */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
