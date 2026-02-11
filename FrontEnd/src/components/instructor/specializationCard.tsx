import React, { useEffect, useState } from "react";
import EditSpecializationsModal from "./editSpecializationCard";
import axiosInstance from "../../utils/axiosInstance"; 

interface InstructorData {
  specialization: string[];
  certifications: string[];
}

const Specializations: React.FC = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [data, setData] = useState<InstructorData>({ specialization: [], certifications: [] });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("instructorId");
    if (storedId) setInstructorId(parseInt(storedId, 10));
  }, []);

  // Helper to handle data that might be an Array OR a comma-separated String
  const parseList = (input: any): string[] => {
    if (Array.isArray(input)) return input;
    if (typeof input === "string") return input.split(",").map((s) => s.trim());
    return [];
  };

  //  Fetch Data using axiosInstance
  useEffect(() => {
    if (instructorId === null) return;
    
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/instructors/${instructorId}/specializations`);
        
        // Axios parses JSON automatically
        const updated = res.data;

        setData({
          specialization: parseList(updated.specialization),
          certifications: parseList(updated.certifications),
        });

      } catch (error: any) {
        // Handle 404 specifically if the backend returns default data on 404
        if (error.response && error.response.status === 404) {
          const updated = error.response.data;
          setData({
            specialization: parseList(updated?.specialization),
            certifications: parseList(updated?.certifications),
          });
        } else {
          console.error("Error fetching specializations:", error);
        }
      }
    };
    
    fetchData();
  }, [instructorId]);

  // ✅ Update Data using axiosInstance
  const handleSave = async (updatedData: InstructorData) => {
    if (!instructorId) return;

    try {
      const res = await axiosInstance.put(
        `/instructors/${instructorId}/specializations`,
        updatedData
      );

      // Axios puts response data in res.data
      const updated = res.data.data || res.data; // Handle potential wrapper

      setData({
        specialization: parseList(updated.specialization),
        certifications: parseList(updated.certifications),
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating specializations:", err);
      alert("Failed to update specializations");
    }
  };

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
        <h3>
          <i className="fas fa-award"></i> Specializations
        </h3>
        <button
          className="edit-icon"
          onClick={() => setIsEditing(true)}
          title="Edit specializations"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="card-content">
        <div className="badges-container">
          {data.specialization && data.specialization.length > 0 ? (
            data.specialization.map((spec, idx) => (
              <span key={idx} className="badge badge-primary">
                {spec}
              </span>
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
      </div>

      {isEditing && (
        <EditSpecializationsModal
          initialData={data}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default Specializations;