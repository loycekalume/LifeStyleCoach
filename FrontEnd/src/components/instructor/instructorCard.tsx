import React from "react";
import "../../styles/instructorCard.css"

export interface Instructor {
  user_id: number;
  name:string;
  specialization: string[]; // array of strings
  website_url?: string;
  certifications: string[]; // array of strings
  years_of_experience: number;
  profile_title: string;
  coaching_mode: "onsite" | "remote" | "both";
  bio: string;
  available_locations: string[];
}

interface InstructorCardProps {
  instructor: Instructor;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  // Safe parsing of specialization array
  const specialization =
    instructor.specialization && instructor.specialization.length > 0
      ? Array.isArray(instructor.specialization)
        ? instructor.specialization
        : (() => {
            try {
              return JSON.parse(instructor.specialization as unknown as string);
            } catch {
              return [];
            }
          })()
      : [];

  // Safe parsing of certifications array
  const certifications =
    instructor.certifications && instructor.certifications.length > 0
      ? Array.isArray(instructor.certifications)
        ? instructor.certifications
        : (() => {
            try {
              return JSON.parse(instructor.certifications as unknown as string);
            } catch {
              return [];
            }
          })()
      : [];

  const locations = instructor.available_locations || [];

  return (
    <div className="instructor-card">
      {/* Instructor Name */}
      <h2 className="instructor-name">{instructor.name || "Unknown Instructor"}</h2>

      {/* Profile Title */}
      <h3>{instructor.profile_title || "No title"}</h3>

      <p><strong>Experience:</strong> {instructor.years_of_experience || 0} years</p>
      <p><strong>Specialization:</strong> {specialization.length > 0 ? specialization.join(", ") : "N/A"}</p>
      <p><strong>Coaching Mode:</strong> {instructor.coaching_mode}</p>
      <p><strong>Certifications:</strong> {certifications.length > 0 ? certifications.join(", ") : "N/A"}</p>
      <p><strong>Locations:</strong> {locations.length > 0 ? locations.join(", ") : "N/A"}</p>

      {instructor.website_url && (
        <p>
          <a href={instructor.website_url} target="_blank" rel="noopener noreferrer">
            Website
          </a>
        </p>
      )}

      <p className="bio">{instructor.bio || ""}</p>

      <button className="contact">Contact Me</button>
    </div>
  );
};

export default InstructorCard;
