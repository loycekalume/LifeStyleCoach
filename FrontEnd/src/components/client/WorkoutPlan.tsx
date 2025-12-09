import { useEffect, useState } from "react";
import "./workout.css"

interface Workout {
  workout_id: number;
  instructor_id: number;
  title: string;
  description: string;
  plan: {
    schedule?: { day: string; workout: string }[];
  };
}

export default function WorkoutPlan() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch("http://localhost:3000/workout");
        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        console.error("Failed to load workouts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkouts();
  }, []);

  if (loading) {
    return <div className="card p-4 text-center">Loading workouts...</div>;
  }

  if (workouts.length === 0) {
    return <div className="card p-4 text-center">No workout plans available</div>;
  }

  return (
    <div className="workout-container">
      {workouts.map((workout) => {
        const isExpanded = expandedId === workout.workout_id;

        return (
          <div
            key={workout.workout_id}
            className={`workout-card ${isExpanded ? "expanded" : ""}`}
          >
            <div
              className="card-header"
              onClick={() =>
                setExpandedId(isExpanded ? null : workout.workout_id)
              }
            >
              <h3>{workout.title}</h3>
              <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
            </div>

            {isExpanded && (
              <div className="card-content">
                <p className="workout-desc">{workout.description}</p>

                {workout.plan?.schedule && (
                  <div className="schedule">
                    {workout.plan.schedule.map((day, index) => (
                      <div key={index} className="day-row">
                        <span className="day-name">{day.day}</span>
                        <span className="day-workout">{day.workout}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className="start-btn">Start</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
