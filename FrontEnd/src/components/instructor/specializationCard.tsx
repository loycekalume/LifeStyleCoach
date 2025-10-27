import React, { useEffect, useState } from "react";

interface InstructorData {
  specialization: string[];
  certifications: string[];
}

// FIX: Change to accept a potentially dynamic ID prop or rely on local storage
const Specializations: React.FC = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);

  const [data, setData] = useState<InstructorData>({
    specialization: [],
    certifications: []
  });

  // 1. Retrieve the instructor ID from localStorage on mount
  useEffect(() => {
    // ✅ FIX: Read the dedicated 'instructorId' key instead of 'userId'
    const storedId = localStorage.getItem("instructorId");
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    }
  }, []);

  // 2. Fetch data only when instructorId is available
  useEffect(() => {
    if (instructorId === null) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/specializations`);
        
        if (!res.ok) {
            // Handle case where instructor profile exists but specializations don't (404)
            if (res.status === 404) {
                console.warn(`No specialization data found for instructor ID: ${instructorId}. Check backend route.`);
                setData({ specialization: [], certifications: [] });
                return;
            }
            throw new Error(`Failed to fetch data (Status: ${res.status})`);
        }

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchData();
  }, [instructorId]); // Depend on the dynamic ID

  // Render loading state if the ID hasn't been set yet
  if (instructorId === null) {
    return (
      <div className="card specializations-card">
        <div className="card-header">
          <h3><i className="fas fa-award"></i> Specializations</h3>
        </div>
        <div className="card-content">
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card specializations-card">
      <div className="card-header">
        <h3><i className="fas fa-award"></i> Specializations</h3>
      </div>
      <div className="card-content">
        <div className="badges-container">
          {data.specialization && data.specialization.length > 0 ? (
            data.specialization.map((spec, idx) => (
              <span key={idx} className="badge badge-primary">{spec}</span>
            ))
          ) : (
            <span>No specializations available</span>
          )}
        </div>
        <div className="certifications">
          <h4>Certifications</h4>
          <ul>
            {data.certifications && data.certifications.length > 0 ? (
              data.certifications.map((cert, idx) => (
                <li key={idx}>• {cert}</li>
              ))
            ) : (
              <li>No certifications available</li>
            )}
          </ul>
        </div>
        {/* For debugging, show which ID was used: */}
        {/* <p className="text-xs mt-2 text-gray-500">Fetched with Instructor ID: {instructorId}</p> */}
      </div>
    </div>
  );
};

export default Specializations;
