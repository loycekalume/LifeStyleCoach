import React, { useEffect, useState } from "react";
import "../../../src/css/instructor.css";

interface PlanItem {
  exercise: string;
  sets?: number;
  reps?: number;
  duration?: number | string;
}

interface Workout {
  workout_id: number;
  title: string;
  description: string;
  plan: PlanItem[];
}

const InstructorWorkouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch("http://localhost:3000/workout?instructor_id=4");
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, []);

  const handleAssign = (workoutId: number) => {
    alert(`Assigning workout ${workoutId} to all clients...`);
    // TODO: backend call
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3>
          <i className="fas fa-dumbbell"></i> Workouts
        </h3>
        <a href="/workouts" className="view-all-link">
          View All
        </a>
      </div>

      <div className="card-content">
        <table className="workouts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Plan</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout.workout_id}>
                <td className="title-col">{workout.title}</td>
                <td>{workout.description}</td>
                <td>
                  <ul className="plan-list">
                    {workout.plan.map((item, index) => (
                      <li key={index}>
                        <strong>{item.exercise}</strong>{" "}
                        {item.sets ? ` | Sets: ${item.sets}` : ""}{" "}
                        {item.reps ? ` | Reps: ${item.reps}` : ""}{" "}
                        {item.duration ? ` | Duration: ${item.duration}s` : ""}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    onClick={() => handleAssign(workout.workout_id)}
                    className="btn-assign"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
            {workouts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  No workouts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorWorkouts;
