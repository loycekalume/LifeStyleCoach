import React, { useState } from "react";
import "../../styles/instructor.css";

// ----------------------------------------------------------------------
// 1. Interfaces
// ----------------------------------------------------------------------

interface Exercise {
  exercise: string;
  sets: number | string;
  reps: number | string;
  duration: number | string;
  rest?: number | string;
}

interface Workout {
  workout_id: number;
  title: string;
  description: string;
  video_url?: string;
  plan: Exercise[];
}

interface WorkoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: number | null; 
}

// ----------------------------------------------------------------------
// 2. Component Implementation
// ----------------------------------------------------------------------

const WorkoutsModal: React.FC<WorkoutsModalProps> = ({ isOpen, onClose, instructorId }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); 
  
  const [exercises, setExercises] = useState<Exercise[]>([{ exercise: "", sets: "", reps: "", duration: "" }]); 

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

  const handleExerciseChange = (
    index: number,
    field: keyof Exercise,
    value: string
  ) => {
    const newExercises = exercises.map((item, i) => {
      if (i === index) {
        // Logic: If user types in Reps, clear Duration (and vice versa)
        if (field === 'reps' && value !== "") {
          return { ...item, [field]: value, duration: "" }; 
        }
        if (field === 'duration' && value !== "") {
          return { ...item, [field]: value, reps: "" }; 
        }
        
        return { ...item, [field]: value };
      }
      return item;
    });
    setExercises(newExercises);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { exercise: "", sets: "", reps: "", duration: "" }]);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

// ----------------------------------------------------------------------
// 4. Submission Handler
// ----------------------------------------------------------------------

  const handleAddWorkout = async () => {
    if (!title.trim() || !description.trim()) {
        alert("Please provide a Title and Description.");
        return;
    }

    const workoutPlan = exercises
      .filter(e => e.exercise.trim() && e.sets && (e.reps || e.duration))
      .map(e => {
        const setsNum = parseInt(e.sets as string);
        const repsNum = e.reps ? parseInt(e.reps as string) : undefined;
        const durationNum = e.duration ? parseInt(e.duration as string) : undefined;
        const restNum = e.rest ? parseInt(e.rest as string) : undefined;
        
        if (isNaN(setsNum) || (repsNum !== undefined && isNaN(repsNum)) || (durationNum !== undefined && isNaN(durationNum))) {
             return null; 
        }

        return {
          exercise: e.exercise.trim(),
          sets: setsNum,
          reps: repsNum,
          duration: durationNum,
          ...(restNum !== undefined && !isNaN(restNum) && { rest: restNum }), 
        };
      })
      .filter((e): e is Exclude<typeof e, null> => e !== null);

    if (workoutPlan.length === 0) {
      alert("Please add at least one valid exercise.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: instructorId, 
          title,
          description,
          video_url: videoUrl,
          plan: workoutPlan, 
        }),
      });

      if (!response.ok) throw new Error(`Failed to add workout`);

      const newWorkout = await response.json();
      setWorkouts([...workouts, newWorkout]);
      
      // Reset
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setExercises([{ exercise: "", sets: "", reps: "", duration: "" }]);
      
      alert(`Workout "${newWorkout.title}" added successfully!`);
      onClose();

    } catch (error) {
      console.error("Error adding workout:", error);
      alert("Failed to add workout.");
    }
  };

// ----------------------------------------------------------------------
// 5. Component JSX
// ----------------------------------------------------------------------

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Workout Plan</h2>

        <div className="workout-form">
          
          <input
            type="text"
            placeholder="Workout Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="url"
            placeholder="Video Demo URL (e.g. YouTube Link)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />

          <textarea
            placeholder="Workout Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <h3>Exercises</h3>
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-item exercise-grid">
                
                <input
                  type="text"
                  placeholder="Name (e.g., Squat)"
                  value={exercise.exercise}
                  onChange={(e) => handleExerciseChange(index, "exercise", e.target.value)}
                />
                
                <input
                  type="number"
                  placeholder="Sets"
                  min="1"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                />
                
                {/* ✅ FIX: Removed 'disabled' attribute.
                   Typing in one field will simply clear the other via handleExerciseChange.
                */}
                <input
                  type="number"
                  placeholder="Reps (e.g., 10)"
                  min="0"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                />
                
                <input
                  type="number"
                  placeholder="Duration (s) (e.g., 60)"
                  min="0"
                  value={exercise.duration}
                  onChange={(e) => handleExerciseChange(index, "duration", e.target.value)}
                />
                
                <input
                  type="number"
                  placeholder="Rest (s) (Optional)"
                  min="0"
                  value={exercise.rest}
                  onChange={(e) => handleExerciseChange(index, "rest", e.target.value)}
                />
                
                {exercises.length > 1 && (
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={handleAddExercise}>
            + Add Exercise
          </button>

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