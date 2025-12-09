import { useEffect, useState } from "react";
import { FaDumbbell, FaUserTie, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
 // We'll assume basic styling or reuse your current CSS

interface Exercise {
  exercise: string;
  sets?: number;
  reps?: number;
  duration?: string;
  rest?: string;
}

interface AssignedWorkout {
  assignment_id: number;
  title: string;
  description: string;
  instructor_name: string;
  instructor_notes: string;
  status: "scheduled" | "completed" | "missed";
  assigned_date: string;
  plan: Exercise[] | any; // Handle the JSONB here
}

export default function ClientWorkouts() {
  const [workouts, setWorkouts] = useState<AssignedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  // Get logged in user ID
  const userId = localStorage.getItem("userId") || 13;

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch(`http://localhost:3000/clientWorkouts/client/assigned-workouts/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkouts(data);
        }
      } catch (err) {
        console.error("Failed to fetch workouts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkouts();
  }, [userId]);

  if (loading) return <div className="p-4">Loading your workouts...</div>;

  return (
    <div className="client-workouts-container" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>My Assigned Workouts</h2>
      
      {workouts.length === 0 ? (
        <p>No workouts assigned yet.</p>
      ) : (
        workouts.map((workout) => (
          <div key={workout.assignment_id} className="workout-detail-card" style={{
            background: "white", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "2rem", overflow: "hidden"
          }}>
            
            {/* Header Section */}
            <div className="card-header" style={{ background: "#f8f9fa", padding: "15px 20px", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#333" }}><FaDumbbell style={{marginRight: "8px"}}/> {workout.title}</h3>
                <span className={`status-badge ${workout.status}`} style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold",
                  background: workout.status === 'completed' ? '#d4edda' : '#fff3cd',
                  color: workout.status === 'completed' ? '#155724' : '#856404'
                }}>
                  {workout.status.toUpperCase()}
                </span>
              </div>
              <div style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666", display: "flex", gap: "15px" }}>
                <span><FaUserTie /> Assigned by: {workout.instructor_name}</span>
                <span><FaCalendarAlt /> Date: {new Date(workout.assigned_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="card-body" style={{ padding: "20px" }}>
              <p><strong>Description:</strong> {workout.description}</p>
              
              {workout.instructor_notes && (
                <div style={{ background: "#e3f2fd", padding: "10px", borderRadius: "5px", marginBottom: "15px", color: "#0d47a1" }}>
                  <FaInfoCircle /> <strong>Note from Instructor:</strong> {workout.instructor_notes}
                </div>
              )}

              {/* Exercises Table */}
              <h4 style={{ marginTop: "20px", borderBottom: "2px solid #eee", paddingBottom: "5px" }}>Exercise Routine</h4>
              
              {Array.isArray(workout.plan) && workout.plan.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                  <thead>
                    <tr style={{ background: "#f1f1f1", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Exercise</th>
                      <th style={{ padding: "10px" }}>Sets</th>
                      <th style={{ padding: "10px" }}>Reps</th>
                      <th style={{ padding: "10px" }}>Duration</th>
                      <th style={{ padding: "10px" }}>Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workout.plan.map((ex, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "10px", fontWeight: "500" }}>{ex.exercise}</td>
                        <td style={{ padding: "10px" }}>{ex.sets || "-"}</td>
                        <td style={{ padding: "10px" }}>{ex.reps || "-"}</td>
                        <td style={{ padding: "10px" }}>{ex.duration || "-"}</td>
                        <td style={{ padding: "10px" }}>{ex.rest || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>No specific exercises listed in plan.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}