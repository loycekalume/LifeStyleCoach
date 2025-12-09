import React, { useEffect, useState, useCallback } from "react";
import EditWorkoutModal from "./editWorkoutModal";
import AssignWorkoutModal from "./assignWorkoutModal";
import type { Workout } from "../../types/workout";
import "../../styles/instructor.css";

interface Client {
  user_id: number;
  name: string;
  email: string;
}

const InstructorWorkouts: React.FC = () => {
  // 🛑 FIX 1: State for dynamic instructor ID
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Assign modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // Get ID from localStorage on mount
  useEffect(() => {
    // ✅ FIX 2: Read the dedicated instructorId key
    const storedId = localStorage.getItem("instructorId");
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    }
  }, []);

  // --- Data Fetching: Workouts (DISPLAY) ---
  useEffect(() => {
    if (instructorId === null) return;

    const fetchWorkouts = async () => {
      try {
        // ✅ FIX 3: Use dynamic instructorId in the query URL for DISPLAY
        const response = await fetch(`http://localhost:3000/workout/instructor/instructor_id=${instructorId}`);
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, [instructorId]); // Depend on dynamic ID

  // --- Data Fetching: Clients ---
  useEffect(() => {
    // Fetch clients regardless of instructorId, but only once
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

  // --- Handlers ---

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
   */
  const handleBatchAssign = useCallback(async (
    workoutId: number,
    clientIds: number[],
    status: string,
    notes: string
  ) => {
    if (instructorId === null) {
      alert("Error: Instructor ID is missing for assignment.");
      return;
    }

    const assignmentPromises = clientIds.map(clientId => {
      const payload = {
        client_id: clientId,
        workout_id: workoutId,
        instructor_id: instructorId, // ✅ FIX 4: Use dynamic instructorId
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
  }, [instructorId]); // Dependency now uses the dynamic ID

  if (instructorId === null) {
    return <div className="card text-center p-4">Loading instructor permissions...</div>;
  }

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
        onAssign={handleBatchAssign} // 👈 NEW BATCH HANDLER
      />
    </div>
  );
};

export default InstructorWorkouts;
