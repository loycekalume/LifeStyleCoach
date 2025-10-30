import React, { useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3000/instructors/${instructorId}/contacts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update contact info");

      const updated = await res.json();
      onSave(updated.contact || updated);
    } catch (err) {
      console.error("Error updating contact info:", err);
      alert("Failed to update contact info");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Edit Contact Info</h3>

        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </label>

          <label>
            Contact:
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </label>

          <label>
            Website URL:
            <input
              type="text"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            />
          </label>

          <label>
            Availability:
            <input
              type="text"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            />
          </label>

          <label>
            Coaching Mode:
            <select
              value={formData.coaching_mode}
              onChange={(e) => setFormData({ ...formData, coaching_mode: e.target.value })}
            >
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="both">Both</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
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

export default EditContactModal;
