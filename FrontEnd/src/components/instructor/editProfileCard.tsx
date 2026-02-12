import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; 

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

  // Local state for locations input to prevent typing issues
  const [locationsInput, setLocationsInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        years_of_experience: profile.years_of_experience ?? null,
        available_locations: profile.available_locations || [],
      });
      // Initialize text input from array
      setLocationsInput((profile.available_locations || []).join(", "));
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert string input back to array for submission
    const locationsArray = locationsInput
      .split(",")
      .map((loc) => loc.trim())
      .filter(Boolean);

    const payload = { ...formData, available_locations: locationsArray };

    try {
      // ✅ Use axiosInstance.put
      const res = await axiosInstance.put(
        `/instructors/${instructorId}/profile`,
        payload
      );

      // Axios returns parsed data in res.data
      const updated = res.data;
      
      onSave(updated.profile || updated);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdropt">
      <div className="modal-contentt">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Profile Title:</label>
            <input
              type="text"
              value={formData.profile_title || ""}
              onChange={(e) =>
                setFormData({ ...formData, profile_title: e.target.value })
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Years of Experience:</label>
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
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Available Locations (comma separated):</label>
            <input
              type="text"
              value={locationsInput}
              onChange={(e) => setLocationsInput(e.target.value)}
              className="form-input"
              placeholder="e.g. New York, Online, Gym A"
            />
          </div>

          <div className="modal-actionst">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;