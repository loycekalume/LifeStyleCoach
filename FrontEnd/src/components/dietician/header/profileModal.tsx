import { useEffect, useState } from "react";
import axios from "axios";
import "./../../../styles/header.css";

interface ProfileModalProps {
  onClose: () => void;
  onUpdate?: (updatedName: string) => void; // 👈 Optional callback
}

export default function ProfileModal({ onClose, onUpdate }: ProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });

  const API_BASE = "http://localhost:3000";

  // Fetch logged-in dietician profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${API_BASE}/dietician/profile`, {
          withCredentials: true, // 🔥 Important
        });

        const data = res.data;

        setFormData({
          name: data.name || "",
          email: data.email || "",
          contact: data.contact || "",
        });
      } catch (error) {
        console.error("Error fetching profile", error);
        alert("Unauthorized. Please login again.");
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

      const res = await axios.put(
        `${API_BASE}/dietician/profile`,
        formData,
        {
          withCredentials: true, //  Important
        }
      );

      alert("Profile updated successfully!");
      
      //  Call the onUpdate callback to update parent component
      if (onUpdate && res.data.user.name) {
        onUpdate(res.data.user.name);
      }
      
      onClose();

    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="modal">Loading...</div>;

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