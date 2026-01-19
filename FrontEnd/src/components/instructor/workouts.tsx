import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import EditWorkoutModal from "../instructor/editWorkoutModal";
import AssignWorkoutModal from "../instructor/assignWorkoutModal"; 
import WorkoutsModal from "./workOutModal"; 
import type { Workout } from "../../types/workout";
import "../../styles/instructor.css";

interface Client {
    user_id: number;
    name: string;
    email: string;
}

const AllWorkoutsPage: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [hiredClients, setHiredClients] = useState<Client[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [instructorId, setInstructorId] = useState<number | null>(null);

    // Modals
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    // ✅ NEW: State for Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false); 

    const workoutsPerPage = 5;
    const navigate = useNavigate();

    // 1. Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedId = localStorage.getItem("instructorId"); 
                if(!storedId) return;
                
                setInstructorId(parseInt(storedId));

                // A. Fetch Workouts
                const workoutsRes = await axiosInstance.get(`/workout/instructor/${storedId}`);
                setWorkouts(workoutsRes.data);

                // B. Fetch Hired Clients
                const clientsRes = await axiosInstance.get("/instructorClients/my-clients");
                setHiredClients(clientsRes.data);

            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        loadData();
    }, []);

    // Pagination Logic
    const indexOfLastWorkout = currentPage * workoutsPerPage;
    const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
    const currentWorkouts = workouts.slice(indexOfFirstWorkout, indexOfLastWorkout);
    const totalPages = Math.ceil(workouts.length / workoutsPerPage);

    // Handlers
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
            await axiosInstance.delete(`/workout/${workoutId}`);
            setWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
        } catch (err) {
            console.error("Error deleting workout:", err);
            alert("Failed to delete.");
        }
    };

    const updateWorkoutInState = (updated: Workout) => {
        setWorkouts((prev) => prev.map((w) => (w.workout_id === updated.workout_id ? updated : w)));
    };

    const handleBatchAssign = async (workoutId: number, clientIds: number[], status: string, notes: string) => {
        const storedId = localStorage.getItem("instructorId");
        try {
            const promises = clientIds.map(clientId => 
                axiosInstance.post("/clientWorkouts", {
                    client_id: clientId,
                    workout_id: workoutId,
                    instructor_id: storedId,
                    status,
                    notes
                })
            );
            await Promise.all(promises);
            alert(`Successfully assigned workout to ${clientIds.length} client(s)!`);
            setIsAssignOpen(false);
        } catch (error) {
            console.error("Assignment error:", error);
            alert("Some assignments may have failed.");
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h2><i className="fas fa-dumbbell"></i> All Workouts</h2>
                    
                    {/* ✅ HEADER ACTIONS: ADD WORKOUT & BACK BUTTON */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setIsCreateOpen(true)}
                        >
                            + Add Workout
                        </button>
                        <button 
                            className="btn btn-outline" 
                            onClick={() => navigate("/instructor")}
                        >
                            ← Back to Profile
                        </button>
                    </div>
                </div>

                <div className="card-content">
                    {/* ... Table logic remains exactly the same ... */}
                    <table className="workouts-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Demo</th>
                                <th>Plan Preview</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentWorkouts.map((workout) => (
                                <tr key={workout.workout_id}>
                                    <td>
                                        <strong>{workout.title}</strong>
                                        <p className="text-sm text-gray-500">{workout.description}</p>
                                    </td>
                                    <td>
                                        {workout.video_url ? (
                                            <a href={workout.video_url} target="_blank" rel="noopener noreferrer" className="btn-video" style={{color:'#2563eb'}}>🎥 Watch</a>
                                        ) : <span style={{color:'#999'}}>No Video</span>}
                                    </td>
                                    <td>
                                        <ul className="plan-list">
                                            {workout.plan.slice(0, 2).map((item: any, i: number) => (
                                                <li key={i}>{item.exercise}</li>
                                            ))}
                                            {workout.plan.length > 2 && <li>...</li>}
                                        </ul>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-assign" onClick={() => handleAssign(workout)} style={{background: '#10b981', color: 'white'}}>Assign</button>
                                            <button className="btn-edit" onClick={() => handleEdit(workout)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(workout.workout_id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                            <span>{currentPage} / {totalPages}</span>
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
                onSave={updateWorkoutInState}
            />

            {/* Assign Modal */}
            <AssignWorkoutModal
                isOpen={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
                clients={hiredClients} 
                selectedWorkout={selectedWorkout}
                onAssign={handleBatchAssign}
            />

            {/* ✅ NEW: Create Workout Modal */}
            <WorkoutsModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                instructorId={instructorId}
            />
        </div>
    );
};

export default AllWorkoutsPage;