import React, { useEffect, useState } from "react";

interface InstructorData {
  specialization: string[];
  certifications: string[];
}

const Specializations: React.FC<{ instructorId: number }> = ({ instructorId }) => {
  const [data, setData] = useState<InstructorData>({
    specialization: [],
    certifications: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/specializations`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchData();
  }, [instructorId]);

  return (
    <div className="card specializations-card">
      <div className="card-header">
        <h3><i className="fas fa-award"></i> Specializations</h3>
      </div>
      <div className="card-content">
        <div className="badges-container">
          {data.specialization.length > 0 ? (
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
            {data.certifications.length > 0 ? (
              data.certifications.map((cert, idx) => (
                <li key={idx}>• {cert}</li>
              ))
            ) : (
              <li>No certifications available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Specializations;
