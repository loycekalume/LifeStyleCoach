import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import hook for navigation
import axiosInstance from "../../utils/axiosInstance"; // 2. Import axios
import "../../styles/instructorCard.css";

export interface Instructor {
  instructor_id: number;
  user_id: number;
  full_name: string;
  specialization: string[];
  website_url?: string;
  certifications: string[];
  years_of_experience: number;
  profile_title: string;
  coaching_mode: "onsite" | "remote" | "both";
  bio: string;
  available_locations: string[];
  match_score?: number;
  match_reason?: string;
}

interface InstructorCardProps {
  instructor: Instructor;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  const navigate = useNavigate(); // 3. Initialize navigation

  // Helper to safely parse JSON or return array
  const parseArray = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as string[];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const specialization = parseArray(instructor.specialization);
  const locations = parseArray(instructor.available_locations);

  // 4. Handle Contact Click Logic
  const handleContactClick = async () => {
    try {
      // call the endpoint we created to get/start a conversation
      // We send the instructor's USER_ID, not the instructor_id
      const response = await axiosInstance.post("/messages/start", {
        instructor_id: instructor.user_id, 
      });

      const { conversationId } = response.data;

      if (conversationId) {
        // Redirect to the chat page with the specific conversation ID
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Unable to contact instructor at the moment. Please try again.");
    }
  };

  return (
    <div className="instructor-card">
      
      {/* Absolute Positioned Match Badge */}
      {instructor.match_score !== undefined && instructor.match_score > 0 && (
        <div className="match-badge">
          {instructor.match_score}% Match
        </div>
      )}

      {/* Header Section */}
      <div className="card-header">
         <h3>{instructor.full_name || "Unknown Instructor"}</h3>
         <span className="instructor-title">
            {instructor.profile_title || "Fitness Coach"} • {instructor.coaching_mode}
         </span>
      </div>

      {/* Body Content */}
      <div className="card-body">
         
         {/* Optional: AI Insight */}
         {instructor.match_reason && (
            <div style={{ fontSize: '0.85rem', backgroundColor: '#fff7ed', color: '#9a3412', padding: '8px', borderRadius: '6px', marginBottom: '12px' }}>
               🤖 <strong>AI Note:</strong> "{instructor.match_reason}"
            </div>
         )}

         {/* Info Rows */}
         <div className="info-row">
            <span className="info-icon">📍</span>
            {locations.length > 0 ? locations.join(", ") : "Remote"}
         </div>

         <div className="info-row">
            <span className="info-icon">⭐</span>
            {instructor.years_of_experience || 0} Years Experience
         </div>

         {/* Tags */}
         <div className="tags-container">
            {specialization.map((spec, i) => (
               <span key={i} className="tag">{spec}</span>
            ))}
         </div>

         {/* Bio with line clamp */}
         <p className="bio-text">
            {instructor.bio || "No bio available."}
         </p>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {instructor.website_url && (
            <a href={instructor.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', textAlign: 'center', color: '#6b7280', textDecoration: 'underline' }}>
                Visit Website
            </a>
          )}
          
          {/* 5. Button now triggers handleContactClick */}
          <button onClick={handleContactClick} className="contact-btn">
            Contact Instructor
          </button>
      </div>

    </div>
  );
};

export default InstructorCard;