import React, { useEffect, useState } from "react";
import EditSpecializationsModal from "./editSpecializationCard"; // ✅ import modal

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

        useEffect(() => {
                if (instructorId === null) return;
                const fetchData = async () => {
                        try {
                                const res = await fetch(`http://localhost:3000/instructors/${instructorId}/specializations`);
                                if (!res.ok) {
                                        if (res.status === 404) {
                                                const updated = await res.json();

                                                setData({
                                                        specialization: Array.isArray(updated.specialization)
                                                                ? updated.specialization
                                                                : updated.specialization
                                                                        ? updated.specialization.split(",").map((s: string) => s.trim())
                                                                        : [],
                                                        certifications: Array.isArray(updated.certifications)
                                                                ? updated.certifications
                                                                : updated.certifications
                                                                        ? updated.certifications.split(",").map((s: string) => s.trim())
                                                                        : [],
                                                });

                                                return;
                                        }
                                        throw new Error(`Failed to fetch data`);
                                }
                                const json = await res.json();
                                setData(json);
                        } catch (error) {
                                console.error("Error fetching specializations:", error);
                        }
                };
                fetchData();
        }, [instructorId]);

        const handleSave = async (updatedData: InstructorData) => {
                if (!instructorId) return;

                try {
                        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/specializations`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updatedData),
                        });

                        if (!res.ok) throw new Error("Failed to update specializations");

                        const result = await res.json();

                        // ✅ Fix: set data from result.data, not result itself
                        const updated = result.data;

                        setData({
                                specialization: Array.isArray(updated.specialization)
                                        ? updated.specialization
                                        : updated.specialization
                                                ? updated.specialization.split(",").map((s: string) => s.trim())
                                                : [],
                                certifications: Array.isArray(updated.certifications)
                                        ? updated.certifications
                                        : updated.certifications
                                                ? updated.certifications.split(",").map((s: string) => s.trim())
                                                : [],
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
