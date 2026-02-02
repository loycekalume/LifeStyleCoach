import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance"; 
import "./../../../styles/header.css";

interface ProfileModalProps {
  onClose: () => void;
  onUpdate?: (updatedName: string) => void;
}

export default function ProfileModal({ onClose, onUpdate }: ProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });

  // Fetch logged-in dietician profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        
        const res = await axiosInstance.get('/dietician/profile');

        const data = res.data;

        setFormData({
          name: data.name || "",
          email: data.email || "",
          contact: data.contact || "",
        });
      } catch (error) {
        console.error("Error fetching profile", error);
        // The global interceptor in axiosInstance will handle 401 redirects
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);


  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Save updated profile
  const handleSave = async () => {
    try {
      setSaving(true);

      // ✅ Use axiosInstance for PUT request
      const res = await axiosInstance.put('/dietician/profile', formData);

      alert("Profile updated successfully!");
      
      // Call the onUpdate callback to update parent component
      // Ensure we safely access the user name from the response
      const updatedName = res.data.user?.name || res.data.name || formData.name;
      
      if (onUpdate && updatedName) {
        onUpdate(updatedName);
      }
      
      onClose();

    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="modal"><div className="modal-content">Loading profile...</div></div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Profile Settings</h2>

        <div className="modal-body">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled // Often email shouldn't be changeable without verification
            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />

          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            className="btn btn-primary1"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}