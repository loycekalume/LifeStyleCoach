import React, { useState } from "react";
import "../../styles/instructor.css";

// ----------------------------------------------------------------------
// 1. Refined Interfaces
// ----------------------------------------------------------------------

// Defines the structure for a single exercise item
interface Exercise {
  exercise: string;
  sets: number | string;       // Number of sets (e.g., 3)
  reps: number | string;       // Number of repetitions (e.g., 12) - now optional in form
  duration: number | string;   // Duration in seconds (e.g., 60) - now optional in form
  rest?: number | string;      // Optional rest time in seconds
}

// Defines the full workout structure (simplified for modal use)
interface Workout {
  workout_id: number;
  title: string;
  description: string;
  plan: Exercise[];
}

interface WorkoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Requires the dynamically loaded instructor ID
  instructorId: number | null; 
}

// ----------------------------------------------------------------------
// 2. Component Implementation
// ----------------------------------------------------------------------

const WorkoutsModal: React.FC<WorkoutsModalProps> = ({ isOpen, onClose, instructorId }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Initialize with one empty exercise row including the new duration field
  const [exercises, setExercises] = useState<Exercise[]>([{ exercise: "", sets: "", reps: "", duration: "" }]); 

  // Check if the required ID is present
  if (!isOpen) return null;
  if (instructorId === null) {
      return (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2>Error</h2>
                  <p>Instructor ID is missing. Please log in again.</p>
                  <button className="btn btn-outline" onClick={onClose}>Close</button>
              </div>
          </div>
      );
  }

// ----------------------------------------------------------------------
// 3. Dynamic Exercise Handlers
// ----------------------------------------------------------------------

  // Function to update a field in a specific exercise object
  const handleExerciseChange = (
    index: number,
    field: keyof Exercise,
    value: string
  ) => {
    const newExercises = exercises.map((item, i) => {
      if (i === index) {
        // Logic to clear the competing field (reps vs. duration)
        if (field === 'reps' && value.trim() !== "") {
          return { ...item, [field]: value, duration: "" }; // Clear duration if reps is entered
        }
        if (field === 'duration' && value.trim() !== "") {
          return { ...item, [field]: value, reps: "" }; // Clear reps if duration is entered
        }
        
        // Default update
        return { ...item, [field]: value };
      }
      return item;
    });
    setExercises(newExercises);
  };

  // Function to add a new empty exercise row
  const handleAddExercise = () => {
    setExercises([...exercises, { exercise: "", sets: "", reps: "", duration: "" }]);
  };

  // Function to remove an exercise row
  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

// ----------------------------------------------------------------------
// 4. Submission Handler
// ----------------------------------------------------------------------

  const handleAddWorkout = async () => {
    if (!title.trim() || !description.trim()) {
        alert("Please provide a Title and Description for the workout.");
        return;
    }

    if (instructorId === null) {
        alert("Cannot save workout: Instructor ID is missing.");
        return;
    }

    // Prepare the final structured plan for the backend
    const workoutPlan = exercises
      .filter(e => e.exercise.trim() && e.sets && (e.reps || e.duration)) // Must have reps OR duration
      .map(e => {
        const setsNum = parseInt(e.sets as string);
        const repsNum = e.reps ? parseInt(e.reps as string) : undefined;
        const durationNum = e.duration ? parseInt(e.duration as string) : undefined;
        const restNum = e.rest ? parseInt(e.rest as string) : undefined;
        
        // Basic validation for numbers
        if (isNaN(setsNum) || (repsNum !== undefined && isNaN(repsNum)) || (durationNum !== undefined && isNaN(durationNum))) {
             // This exercise item is invalid, we could filter it out or throw an error
             return null; 
        }

        // Return the cleaned object for the plan array
        return {
          exercise: e.exercise.trim(),
          sets: setsNum,
          reps: repsNum,
          duration: durationNum,
          // Only include rest if it's a valid number
          ...(restNum !== undefined && !isNaN(restNum) && { rest: restNum }), 
        };
      })
      .filter((e): e is Exclude<typeof e, null> => e !== null); // Filter out any invalid items

    if (workoutPlan.length === 0) {
      alert("Please add at least one valid exercise with a name, sets, and either reps or duration.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Using the dynamic instructorId prop
          instructor_id: instructorId, 
          title,
          description,
          plan: workoutPlan, // Array sent to backend
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add workout: ${response.status}`);
      }

      const newWorkout = await response.json();

      setWorkouts([...workouts, newWorkout]);
      // Reset form state
      setTitle("");
      setDescription("");
      setExercises([{ exercise: "", sets: "", reps: "", duration: "" }]);
      
      alert(`Workout "${newWorkout.title}" added successfully!`);

    } catch (error) {
      console.error("Error adding workout:", error);
      alert("Failed to add workout. Please check your inputs and network connection.");
    }
  };

// ----------------------------------------------------------------------
// 5. Component JSX (Render)
// ----------------------------------------------------------------------

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Workout Plan</h2>

        <div className="workout-form">
          
          {/* Title and Description Inputs */}
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

          {/* Dynamic Exercise List */}
          <h3>Exercises</h3>
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-item exercise-grid">
                
                {/* Exercise Name */}
                <input
                  type="text"
                  placeholder="Name (e.g., Squat)"
                  value={exercise.exercise}
                  onChange={(e) => handleExerciseChange(index, "exercise", e.target.value)}
                />
                
                {/* Sets */}
                <input
                  type="number"
                  placeholder="Sets"
                  min="1"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                />
                
                {/* Reps (Mutually exclusive with Duration) */}
                <input
                  type="number"
                  placeholder="Reps (e.g., 10)"
                  min="0"
                  value={exercise.reps}
                  disabled={!!exercise.duration} // Disable if Duration is filled
                  onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                />
                
                {/* Duration (Mutually exclusive with Reps) */}
                <input
                  type="number"
                  placeholder="Duration (s) (e.g., 60)"
                  min="0"
                  value={exercise.duration}
                  disabled={!!exercise.reps} // Disable if Reps is filled
                  onChange={(e) => handleExerciseChange(index, "duration", e.target.value)}
                />
                
                {/* Rest */}
                <input
                  type="number"
                  placeholder="Rest (s) (Optional)"
                  min="0"
                  value={exercise.rest}
                  onChange={(e) => handleExerciseChange(index, "rest", e.target.value)}
                />
                
                {/* Remove Button */}
                {exercises.length > 1 && (
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveExercise(index)}
                    title="Remove Exercise"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Exercise Button */}
          <button className="btn btn-secondary" onClick={handleAddExercise}>
            + Add Exercise
          </button>

          {/* Submit Button */}
          <button className="btn btn-primary" onClick={handleAddWorkout}>
            Save Workout
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
