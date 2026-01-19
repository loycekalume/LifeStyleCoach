import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/instructor.css";

// ✅ Define interface for the Assignment Log
interface Assignment {
  assignment_id: number;
  client_name: string;
  client_email: string;
  workout_title: string;
  date_assigned: string;
  status: string;
}

const InstructorWorkouts: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  // 1. Get ID
  useEffect(() => {
    const storedId = localStorage.getItem("instructorId");
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    } else {
        setLoading(false); // Stop loading if no ID
    }
  }, []);

  // 2. Fetch Assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!instructorId) return;

      try {
        // Calls the new endpoint we just created
        const response = await axiosInstance.get(`/instructors/assignments/${instructorId}`);
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [instructorId]);

  if (loading) return <div className="card-content">Loading recent assignments...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>
          <i className="fas fa-clipboard-list"></i> Recent Assignments
        </h3>
        {/* ❌ Removed "View All" button as requested */}
      </div>

      <div className="card-content">
        <table className="workouts-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Assigned Workout</th>
              <th>Date Assigned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((assign) => (
                <tr key={assign.assignment_id}>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{assign.client_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>{assign.client_email}</div>
                  </td>
                  <td>{assign.workout_title}</td>
                  <td>
                    {new Date(assign.date_assigned).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    {/* Simple status badge */}
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        backgroundColor: assign.status === "completed" ? "#dcfce7" : "#fef3c7",
                        color: assign.status === "completed" ? "#166534" : "#92400e",
                        textTransform: "capitalize"
                      }}
                    >
                      {assign.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center" style={{ padding: "20px", color: "#666" }}>
                  No workouts have been assigned yet.
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