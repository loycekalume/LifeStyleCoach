import React, { useState } from "react";

interface EditSpecializationsModalProps {
  initialData: {
    specialization: string[];
    certifications: string[];
  };
  onSave: (updatedData: { specialization: string[]; certifications: string[] }) => void;
  onClose: () => void;
}

const EditSpecializationsModal: React.FC<EditSpecializationsModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [specialization, setSpecialization] = useState(initialData.specialization.join(", "));
  const [certifications, setCertifications] = useState(initialData.certifications.join(", "));

  const handleSave = () => {
    const updatedData = {
      specialization: specialization.split(",").map(s => s.trim()).filter(Boolean),
      certifications: certifications.split(",").map(c => c.trim()).filter(Boolean),
    };
    onSave(updatedData);
  };

  return (
    <div className="modal-backdropt">
      <div className="modal-cardt">
        <h3>Edit Specializations</h3>
        <label>Specializations (comma-separated)</label>
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
        <label>Certifications (comma-separated)</label>
        <input
          type="text"
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
        />
        <div className="modal-actionst">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditSpecializationsModal;
