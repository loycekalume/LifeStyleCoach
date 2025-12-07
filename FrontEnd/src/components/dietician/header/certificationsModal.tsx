import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance"; 
import "./../../../styles/header.css";

interface CertificationModalProps {
  onClose: () => void;
}

export default function CertificationModal({ onClose }: CertificationModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certifications, setCertifications] = useState<string[]>([""]);


  useEffect(() => {
    async function fetchCertification() {
      try {
        const res = await axiosInstance.get("dietician/certification");
        
        const certs = res.data.certification;
        // If there are certifications, use them; otherwise start with one empty field
        setCertifications(certs && certs.length > 0 ? certs : [""]);
      } catch (error) {
        console.error("Error fetching certification", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCertification();
  }, []);

  const handleChange = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  const handleAdd = () => {
    setCertifications([...certifications, ""]);
  };

  const handleRemove = (index: number) => {
    if (certifications.length === 1) {
      alert("You must have at least one certification field");
      return;
    }
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
  };

  const handleSave = async () => {
    // Filter out empty certifications
    const validCerts = certifications.filter(cert => cert.trim() !== "");

    if (validCerts.length === 0) {
      alert("Please enter at least one certification");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put(
        "dietician/certification",
        { certification: validCerts },
        
      );
      alert("Certifications updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating certification", error);
      alert("Failed to update certifications.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="modal">Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Certifications</h2>

        <div className="modal-body">
          {certifications.map((cert, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <label>Certification {index + 1}</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="e.g., Registered Dietitian Nutritionist (RDN)"
                  value={cert}
                  onChange={(e) => handleChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="btn btn-ghost"
                  style={{ 
                    padding: "8px 12px", 
                    minWidth: "auto",
                    color: "#ef4444"
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-ghost"
            style={{ marginTop: "10px", width: "100%" }}
          >
            <i className="fas fa-plus"></i> Add Another Certification
          </button>

          <small style={{ color: "#666", fontSize: "0.9em", marginTop: "15px", display: "block" }}>
            Enter your professional certifications and credentials
          </small>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
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