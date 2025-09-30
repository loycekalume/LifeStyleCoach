
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditWorkoutModal from "../instructor/editWorkoutModal";
import AssignWorkoutModal from "../instructor/assignWorkoutModal";
import type { Workout } from "../../types/workout";
import "../../css/instructor.css";

interface Client {
    user_id: number;
    name: string;
    email: string;
}

const AllWorkoutsPage: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // Edit Modal
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Assign Modal
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const workoutsPerPage = 5;
    const navigate = useNavigate();

    // Fetch workouts
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

    // Fetch clients
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch("http://localhost:3000/client");
                const data = await response.json();
                setClients(data.clients);
            } catch (err) {
                console.error("Error fetching clients:", err);
            }
        };
        fetchClients();
    }, []);

    // Pagination
    const indexOfLastWorkout = currentPage * workoutsPerPage;
    const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
    const currentWorkouts = workouts.slice(indexOfFirstWorkout, indexOfLastWorkout);
    const totalPages = Math.ceil(workouts.length / workoutsPerPage);


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
            const res = await fetch(`http://localhost:3000/workout/${workoutId}`, { method: "DELETE" });
            if (res.ok) {
                setWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
            }
        } catch (err) {
            console.error("Error deleting workout:", err);
        }
    };

    const updateWorkout = (updatedWorkout: Workout) => {
        setWorkouts((prev) =>
            prev.map((w) => (w.workout_id === updatedWorkout.workout_id ? updatedWorkout : w))
        );
    };

    const confirmAssign = async () => {
        if (!selectedWorkout || !selectedClientId) {
            alert("Please select a client.");
            return;
        }

        const payload = {
            client_id: selectedClientId,
            workout_id: selectedWorkout.workout_id,
            instructor_id: 4,
            status: "scheduled",
            notes: "do this for 6 weeks",
        };

        console.log("Sending assignment:", payload);

        try {
            const res = await fetch("http://localhost:3000/clientWorkouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Workout assigned successfully!");
                setIsAssignOpen(false);
                setSelectedClientId(null);
            } else {
                alert(data.message || "Failed to assign workout.");
            }
        } catch (err) {
            console.error("Error assigning workout:", err);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h2>
                        <i className="fas fa-dumbbell"></i> All Workouts
                    </h2>
                    <button className="btn btn-outline" onClick={() => navigate("/")}>
                        ← Back to Profile
                    </button>
                </div>

                <div className="card-content">
                    <table className="workouts-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Plan</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentWorkouts.map((workout) => (
                                <tr key={workout.workout_id}>
                                    <td>{workout.title}</td>
                                    <td>{workout.description}</td>
                                    <td>
                                        <ul className="plan-list">
                                            {workout.plan.map((item, i) => (
                                                <li key={i}>
                                                    {item.exercise} {item.sets && `| Sets: ${item.sets}`}{" "}
                                                    {item.reps && `| Reps: ${item.reps}`}{" "}
                                                    {item.duration && `| Duration: ${item.duration}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>{workout.created_at ? new Date(workout.created_at).toLocaleDateString() : "-"}</td>
                                    <td>
                                        <button className="btn-assign" onClick={() => handleAssign(workout)}>Assign</button>
                                        <button className="btn-edit" onClick={() => handleEdit(workout)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(workout.workout_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {currentWorkouts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center">No workouts found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                        </div>
                    )}
                </div>
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

export default AllWorkoutsPage;
