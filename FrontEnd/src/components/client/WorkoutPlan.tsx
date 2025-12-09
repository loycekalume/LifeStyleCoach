import { useEffect, useState } from "react";
import "./workout.css"

interface AssignedWorkout {
  assignment_id: number;
  workout_id: number;
  status: "scheduled" | "completed" | "missed";
  title: string;
  description: string;
  plan: {
    schedule?: { day: string; workout: string }[];
  };
  instructor_name: string;
  notes?: string;
}

interface Props {
    client?: any; 
}

export default function WorkoutPlan({ client }: Props) {
  const [workouts, setWorkouts] = useState<AssignedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Get User ID from storage (fallback to 13)
  const userId = localStorage.getItem("userId") || 13;

  useEffect(() => {
    async function fetchMyWorkouts() {
      try {
        // MATCHING THE NEW ROUTE WE JUST CREATED
        const res = await fetch(`http://localhost:3000/clientWorkouts/client/${userId}/workouts`);
        
        if (res.ok) {
            const data = await res.json();
            setWorkouts(data);
        } else {
            console.error("Failed to fetch workouts");
        }
      } catch (err) {
        console.error("Error loading workouts:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
        fetchMyWorkouts();
    }
  }, [userId]);

  if (loading) {
    return <div className="card p-4 text-center">Loading your plan...</div>;
  }

  if (workouts.length === 0) {
    return (
        <div className="workout-container">
             <div className="card p-4 text-center" style={{color: '#666'}}>
                <h3>No Active Plans</h3>
                <p>Your instructor hasn't assigned a plan yet.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="workout-container">
      <h2 style={{marginBottom: '1rem', fontSize: '1.2rem', color: '#333'}}>Your Assigned Plans</h2>

      {workouts.map((workout) => {
        const isExpanded = expandedId === workout.assignment_id;

        return (
          <div
            key={workout.assignment_id}
            className={`workout-card ${isExpanded ? "expanded" : ""}`}
            // Add a visual indicator for status
            style={{ borderLeft: workout.status === 'completed' ? '5px solid #2ecc71' : '5px solid #ff6b6b' }}
          >
            <div
              className="card-header"
              onClick={() =>
                setExpandedId(isExpanded ? null : workout.assignment_id)
              }
            >
              <div className="header-info">
                <h3>{workout.title}</h3>
                <small className="instructor-tag">Instructor: {workout.instructor_name}</small>
              </div>
              <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
            </div>

            {isExpanded && (
              <div className="card-content">
                <p className="workout-desc">{workout.description}</p>
                
                {workout.notes && (
                    <div className="instructor-notes" style={{background: '#fff3cd', padding: '10px', borderRadius:'5px', marginBottom:'10px', fontSize:'0.9rem'}}>
                        <strong>Note from Instructor:</strong> {workout.notes}
                    </div>
                )}

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

                <button className="start-btn">
                    {workout.status === 'completed' ? 'Completed' : 'Start Session'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}