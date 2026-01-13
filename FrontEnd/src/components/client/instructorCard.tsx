import React from "react";
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

  return (
    <div className="instructor-card">
      
      {/* 1. Absolute Positioned Match Badge */}
      {instructor.match_score !== undefined && instructor.match_score > 0 && (
        <div className="match-badge">
          {instructor.match_score}% Match
        </div>
      )}

      {/* 2. Header Section */}
      <div className="card-header">
         {/* Name mapped to h3 as per CSS */}
         <h3>{instructor.full_name || "Unknown Instructor"}</h3>
         <span className="instructor-title">
            {instructor.profile_title || "Fitness Coach"} • {instructor.coaching_mode}
         </span>
      </div>

      {/* 3. Body Content */}
      <div className="card-body">
         
         {/* Optional: AI Insight (Styled inline for now) */}
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

      {/* 4. Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {instructor.website_url && (
            <a href={instructor.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', textAlign: 'center', color: '#6b7280', textDecoration: 'underline' }}>
                Visit Website
            </a>
          )}
          
          <button className="contact-btn">
            Contact Instructor
          </button>
      </div>

    </div>
  );
};

export default InstructorCard;