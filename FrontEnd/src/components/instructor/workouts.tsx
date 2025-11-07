import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Assuming imports for modals and types are correct
import EditWorkoutModal from "../instructor/editWorkoutModal";
import AssignWorkoutModal from "../instructor/assignWorkoutModal"; 
import type { Workout } from "../../types/workout";
import "../../styles/instructor.css";

interface Client {
    user_id: number;
    name: string;
    email: string;
}

const AllWorkoutsPage: React.FC = () => {
    // 🛑 NEW: State for instructor ID
    const [instructorId, setInstructorId] = useState<number | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // Edit Modal
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Assign Modal
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    const workoutsPerPage = 5;
    const navigate = useNavigate();

    // ✅ FIX 1: Retrieve the specialized instructorId from localStorage
    useEffect(() => {
        const storedInstructorId = localStorage.getItem("instructorId");
        if (storedInstructorId) {
            setInstructorId(parseInt(storedInstructorId, 10));
        } else {
            // If the specific ID is missing, redirect to ensure a safe state
            // In a production app, you might redirect to /login here.
        }
    }, []);

    // Fetch workouts (runs when instructorId changes from null to a number)
    useEffect(() => {
        if (instructorId === null) return;

        const fetchWorkouts = async () => {
            try {
                // ✅ FIX 2: Use dynamic instructorId
                const response = await fetch(`http://localhost:3000/workout/instructor/instructor_id=${instructorId}`);
                const data = await response.json();
                setWorkouts(data);
            } catch (error) {
                console.error("Error fetching workouts:", error);
            }
        };
        fetchWorkouts();
    }, [instructorId]); // Dependency array includes the dynamic ID

    // Fetch clients (runs when instructorId changes from null to a number)
    useEffect(() => {
        if (instructorId === null) return;
        
        const fetchClients = async () => {
            try {
                // NOTE: Ideally, you should update this backend endpoint to filter clients by instructor_id
                const response = await fetch("http://localhost:3000/client"); 
                const data = await response.json();
                setClients(data.clients);
            } catch (err) {
                console.error("Error fetching clients:", err);
            }
        };
        fetchClients();
    }, [instructorId]); // Dependency array includes the dynamic ID

    // Show loading state while waiting for ID
    if (instructorId === null) {
        return (
            <div className="container text-center py-10">
                <p>Loading instructor data...</p>
            </div>
        );
    }

    // Pagination (No changes needed here)
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
    
    // ... handleDelete and updateWorkout methods (No changes needed)
    const handleDelete = async (workoutId: number) => {
        // ... (Existing deletion logic)
        if (!window.confirm("Delete this workout?")) return;
        try {
            const res = await fetch(`http://localhost:3000/workout/${workoutId}`, { method: "DELETE" });
            if (res.ok) {
                setWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
            } else {
                alert("Failed to delete workout.");
            }
        } catch (err) {
            console.error("Error deleting workout:", err);
        }
    };

    const updateWorkout = (updatedWorkout: Workout) => {
        // ... (Existing update logic)
        setWorkouts((prev) =>
            prev.map((w) => (w.workout_id === updatedWorkout.workout_id ? updatedWorkout : w))
        );
    };

    // NEW BATCH ASSIGNMENT HANDLER
    const handleBatchAssign = async (
        workoutId: number, 
        clientIds: number[], 
        status: string, 
        notes: string
    ) => {
        const assignmentPromises = clientIds.map(clientId => {
            const payload = {
                client_id: clientId,
                workout_id: workoutId,
                instructor_id: instructorId, // ✅ FIX 3: Use dynamic instructorId
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

        // Wait for all assignment calls to finish
        const results = await Promise.all(assignmentPromises);

        const failedAssignments = results.filter(r => r && r.success === false);

        if (failedAssignments.length === 0) {
            alert(`Successfully assigned workout to ${clientIds.length} client(s)!`);
        } else if (failedAssignments.length < clientIds.length) {
            alert(`Assigned workout to some clients, but failed for ${failedAssignments.length} client(s). Check console for details.`);
        } else {
            alert("Failed to assign workout to any selected clients. Check console for details.");
        }
    };

    return (
        <div className="container">
            {/* ... (Existing JSX for table, pagination, etc.) ... */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h2><i className="fas fa-dumbbell"></i> All Workouts</h2>
                    <button className="btn btn-outline" onClick={() => navigate("/instructor")}>
                        ← Back to Profile
                    </button>
                </div>

                <div className="card-content">
                    {/* ... (Workouts Table JSX) ... */}
                    <table className="workouts-table">
                        {/* ... (thead and tr map remains the same) ... */}
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
                                        {/* Simplified plan display */}
                                        <ul className="plan-list">
                                            {workout.plan.slice(0, 3).map((item, i) => (
                                                <li key={i}>
                                                    {item.exercise} | Sets: {item.sets}
                                                    {item.reps ? ` | Reps: ${item.reps}` : ` | Duration: ${item.duration}s`}
                                                </li>
                                            ))}
                                            {workout.plan.length > 3 && <li>...</li>}
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
                    {/* ... (Pagination JSX) ... */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal (No changes) */}
            <EditWorkoutModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                workout={selectedWorkout}
                onSave={updateWorkout}
            />

            {/* Assign Modal (Updated Props) */}
            <AssignWorkoutModal
                isOpen={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
                clients={clients}
                selectedWorkout={selectedWorkout}
                // Pass the new batch assignment handler to the modal
               onAssign={handleBatchAssign}
            />
        </div>
    );
};

export default AllWorkoutsPage;
