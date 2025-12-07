import { useEffect, useState } from "react";
import axios from "axios";

interface SpecializationModalProps {
  onClose: () => void;
}

export default function SpecializationModal({ onClose }: SpecializationModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    specialization: "",
    years_of_experience: "",
    clinic_name: "",
    clinic_address: "",
  });

  const API_BASE = "http://localhost:3000";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${API_BASE}/dietician/specialization`, {
          withCredentials: true,
        });
        setFormData({
          specialization: res.data.specialization || "",
          years_of_experience: res.data.years_of_experience || "",
          clinic_name: res.data.clinic_name || "",
          clinic_address: res.data.clinic_address || "",
        });
      } catch (error) {
        console.error("Error fetching specialization", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/dietician/specialization`, formData, {
        withCredentials: true,
      });
      alert("Specialization updated!");
      onClose();
    } catch (error) {
      console.error("Error updating", error);
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="modal">Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Specialization Settings</h2>
        <div className="modal-body">
          <label>Specialization</label>
          <input name="specialization" value={formData.specialization} onChange={handleChange} />
          
          <label>Years of Experience</label>
          <input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} />
          
          <label>Clinic Name</label>
          <input name="clinic_name" value={formData.clinic_name} onChange={handleChange} />
          
          <label>Clinic Address</label>
          <textarea name="clinic_address" value={formData.clinic_address} onChange={handleChange} />
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary1" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}