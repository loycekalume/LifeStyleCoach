import React, { useEffect, useState } from "react";
import InstructorCard from "./instructorCard";


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

const InstructorsList: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch("http://localhost:3000/instructors");
        if (!response.ok) throw new Error("Failed to fetch instructors");

        const result = await response.json();
        console.log("Full response:", result);

        // Directly use result.instructor array
        setInstructors(result.instructor || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) return <p>Loading instructors...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="instructors-list">
      {instructors.map((inst) => (
        <InstructorCard key={inst.user_id} instructor={inst} />
      ))}
    </div>
  );
};

export default InstructorsList;
