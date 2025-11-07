import React, { useEffect, useState } from "react";

interface InstructorProfile {
    name?: string;
    profile_title?: string | null;
    years_of_experience?: number | null;
    available_locations?: string[] | null;
}

interface EditProfileModalProps {
    instructorId: number;
    profile: InstructorProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedProfile: InstructorProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    instructorId,
    profile,
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<InstructorProfile>({
        name: "",
        profile_title: "",
        years_of_experience: null,
        available_locations: [],
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                ...profile,
                years_of_experience:
                    profile.years_of_experience ?? null, // ensure null, not undefined
                available_locations: profile.available_locations || [],
            });
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(
                `http://localhost:3000/instructors/${instructorId}/profile`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) throw new Error("Failed to update profile");

            const updated = await res.json();
            onSave(updated.profile || updated);
            onClose();
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile");
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Edit Profile</h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        Profile Title:
                        <input
                            type="text"
                            value={formData.profile_title || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, profile_title: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        Years of Experience:
                        <input
                            type="number"
                            value={
                                formData.years_of_experience !== null &&
                                    formData.years_of_experience !== undefined
                                    ? formData.years_of_experience
                                    : ""
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    years_of_experience:
                                        e.target.value === "" ? null : Number(e.target.value),
                                })
                            }
                        />
                    </label>


                    <label>
                        Available Locations (comma separated):
                        <input
                            type="text"
                            value={formData.available_locations?.join(", ") || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    available_locations: e.target.value
                                        .split(",")
                                        .map((loc) => loc.trim())
                                        .filter(Boolean),
                                })
                            }
                        />
                    </label>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
