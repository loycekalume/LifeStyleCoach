import React, { useEffect, useState } from "react";
import InstructorCard, { type Instructor } from "./instructorCard"; // Consolidated import
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/instructorCard.css"; // Ensure CSS is imported

const InstructorsList: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axiosInstance.get("/matchinstructor/match");
        console.log("AI Match Response:", response.data);
        
        // Ensure we pass an array, even if data is null
        setInstructors(response.data.data || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) return (
     <div className="loading-container">
        <div className="spinner"></div>
        <p>AI is finding your perfect match...</p>
     </div>
  );
  
  if (error) return (
    <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
    </div>
  );

  return (
    <div className="match-page-container">
      
      {/* Header Section */}
      <div className="list-header">
        <h2>Recommended for You</h2>
        <p>Based on your specific goals, location, and health profile.</p>
      </div>
      
      {/* The Grid - This matches the .instructors-list CSS class we created */}
      <div className="instructors-list">
        {instructors.length > 0 ? (
            instructors.map((inst) => (
              <InstructorCard key={inst.instructor_id} instructor={inst} />
            ))
        ) : (
            <div className="no-results">
                <p>No specific matches found. Try updating your profile preferences.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default InstructorsList;