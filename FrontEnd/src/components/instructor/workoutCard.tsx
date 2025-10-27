import React, { useEffect, useState, useCallback } from "react"; // 👈 ADDED useCallback
import EditWorkoutModal from "./editWorkoutModal";
import AssignWorkoutModal from "./assignWorkoutModal";
import type { Workout } from "../../types/workout";
import "../../styles/instructor.css";

interface Client {
  user_id: number;
  name: string;
  email: string;
}

const INSTRUCTOR_ID = 4; // Constant for instructor ID

const InstructorWorkouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Assign modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  // ❌ REMOVED: selectedClientId is no longer needed in the parent component
  // const [selectedClientId, setSelectedClientId] = useState<number | null>(null); 

  // --- Data Fetching (No changes needed) ---
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/workout?instructor_id=${INSTRUCTOR_ID}`);
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://localhost:3000/client");
        const data = await res.json();
        setClients(data.clients || data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  // --- Handlers (Assignment Flow Updated) ---

  const handleAssign = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsAssignOpen(true);
  };

  const handleEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsEditOpen(true);
  };

  const handleDelete = async (workoutId: number) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      const res = await fetch(`http://localhost:3000/workout/${workoutId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
      }
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.workout_id === updatedWorkout.workout_id ? updatedWorkout : w
      )
    );
  };

  /**
   * BATCH ASSIGNMENT HANDLER (Wrapped in useCallback for stability)
   * This replaces the old confirmAssign logic.
   */
  const handleBatchAssign = useCallback(async (
      workoutId: number, 
      clientIds: number[], 
      status: string, 
      notes: string
  ) => {
      const assignmentPromises = clientIds.map(clientId => {
          const payload = {
              client_id: clientId,
              workout_id: workoutId,
              instructor_id: INSTRUCTOR_ID,
              status: status,
              notes: notes,
          };
          
          return fetch("http://localhost:3000/clientWorkouts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
          })
          .then(res => {
              if (!res.ok) {
                  return res.json().then(data => Promise.reject(new Error(`Client ${clientId}: ${data.message || 'Failed'}`)));
              }
              return res.json();
          })
          .catch(err => {
              console.error(`Assignment error for client ${clientId}:`, err.message);
              return { success: false, client: clientId, error: err.message };
          });
      });

      const results = await Promise.all(assignmentPromises);

      const failedAssignments = results.filter(r => r && r.success === false);

      if (failedAssignments.length === 0) {
          alert(`Successfully assigned workout to ${clientIds.length} client(s)!`);
      } else if (failedAssignments.length < clientIds.length) {
          alert(`Assigned workout to some clients, but failed for ${failedAssignments.length} client(s). Check console for details.`);
      } else {
          alert("Failed to assign workout to any selected clients. Check console for details.");
      }
  }, [INSTRUCTOR_ID]); // Dependency: INSTRUCTOR_ID

  // ❌ DELETED: The old `confirmAssign` function is deleted here as it's replaced by `handleBatchAssign`.


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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workouts.slice(0, 5).map((workout) => (
              <tr key={workout.workout_id}>
                <td>{workout.title}</td>
                <td>{workout.description}</td>
                <td>
                  <ul className="plan-list">
                    {workout.plan.map((item, index) => (
                      <li key={index}>
                        {item.exercise}{" "}
                        {item.sets && `| Sets: ${item.sets}`}{" "}
                        {item.reps ? `| Reps: ${item.reps}` : ''}
                      {item.duration ? `| Duration: ${item.duration}s` : ''} 
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    onClick={() => handleAssign(workout)}
                    className="btn-assign"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => handleEdit(workout)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workout.workout_id)}
                    className="btn-delete"
                  >
                    Delete
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

      {/* Edit Modal */}
      <EditWorkoutModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        workout={selectedWorkout}
        onSave={updateWorkout}
      />

      {/* Assign Modal (UPDATED PROPS) */}
      <AssignWorkoutModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        clients={clients}
        selectedWorkout={selectedWorkout}
        // ❌ DELETED: selectedClientId and setSelectedClientId
        // ❌ DELETED: confirmAssign
        onAssign={handleBatchAssign} // 👈 NEW BATCH HANDLER
      />
    </div>
  );
};

export default InstructorWorkouts;