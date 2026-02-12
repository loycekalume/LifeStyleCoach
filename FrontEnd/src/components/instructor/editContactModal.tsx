import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; 
interface ContactInfo {
  name: string; 
  email: string;
  contact: string;
  website_url: string;
  availability: string;
  coaching_mode: string;
}

interface EditContactModalProps {
  instructorId: number;
  contact: ContactInfo;
  onClose: () => void;
  onSave: (updatedData: ContactInfo) => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  instructorId,
  contact,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState(contact);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
 
      const res = await axiosInstance.put(
        `/instructors/${instructorId}/contacts`,
        formData
      );

      // Axios returns parsed data in res.data
      const updated = res.data;
      
      // Handle potential response structure differences (e.g., { message: "...", contact: {...} })
      onSave(updated.contact || updated);
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Error updating contact info:", err);
      alert("Failed to update contact info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdropt">
      <div className="modal-contentt">
        <h3>Edit Contact Info</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Contact Number:</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Website URL:</label>
            <input
              type="text"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="form-input"
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Availability:</label>
            <input
              type="text"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="form-input"
              placeholder="e.g. Mon-Fri 9am-5pm"
            />
          </div>

          <div className="form-group">
            <label>Coaching Mode:</label>
            <select
              value={formData.coaching_mode}
              onChange={(e) => setFormData({ ...formData, coaching_mode: e.target.value })}
              className="form-select"
            >
              <option value="onsite">Onsite (In-Person)</option>
              <option value="remote">Remote (Online)</option>
              <option value="both">Hybrid (Both)</option>
            </select>
          </div>

          <div className="modal-actionst">
            <button 
              type="button" 
              className="btnt btn-outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btnt btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;