import React, { useEffect, useState } from "react";
import EditWorkoutModal from "./editWorkoutModal";
import AssignWorkoutModal from "./assignWorkoutModal";
import type { Workout } from "../../types/workout";
import "../../css/instructor.css";

interface Client {
  user_id: number;   // ✅ FIXED: was client_id before
  name: string;
  email: string;
}

const InstructorWorkouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Assign modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://localhost:3000/client");
        const data = await res.json();
        setClients(data.clients || data); // ✅ ensure correct structure
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

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

  const confirmAssign = async () => {
    if (!selectedWorkout || !selectedClientId) {
      alert("Please select a client.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/clientWorkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_id: selectedWorkout.workout_id,
          client_id: selectedClientId, // ✅ now matches user_id from dropdown
          instructor_id: 4, // hardcoded for now
        }),
      });

      if (res.ok) {
        alert("Workout assigned successfully!");
        setIsAssignOpen(false);
        setSelectedClientId(null);
      } else {
        alert("Failed to assign workout.");
      }
    } catch (err) {
      console.error("Error assigning workout:", err);
    }
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
                        {item.reps && `| Reps: ${item.reps}`}{" "}
                        {item.duration && `| Duration: ${item.duration}`}
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

      {/* Assign Modal */}
      <AssignWorkoutModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        clients={clients}
        selectedWorkout={selectedWorkout}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        confirmAssign={confirmAssign}
      />
    </div>
  );
};

export default InstructorWorkouts;
