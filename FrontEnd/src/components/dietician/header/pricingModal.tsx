import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance"; 
import "./../../../styles/header.css";

interface PricingModalProps {
  onClose: () => void;
}

export default function PricingModal({ onClose }: PricingModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    consultation_fee: "",
    session_fee: "",
    monthly_fee: "",
  });

 

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await axiosInstance.get("dietician/pricing" );
        
        setFormData({
          consultation_fee: res.data.consultation_fee || "",
          session_fee: res.data.session_fee || "",
          monthly_fee: res.data.monthly_fee || "",
        });
      } catch (error) {
        console.error("Error fetching pricing", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validate at least one price is entered
    if (!formData.consultation_fee && !formData.session_fee && !formData.monthly_fee) {
      alert("Please enter at least one pricing option");
      return;
    }

    // Validate each entered price
    const validatePrice = (price: string, name: string) => {
      if (price) {
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
          alert(`Please enter a valid ${name} (positive number)`);
          return false;
        }
      }
      return true;
    };

    if (!validatePrice(formData.consultation_fee, "consultation fee")) return;
    if (!validatePrice(formData.session_fee, "session fee")) return;
    if (!validatePrice(formData.monthly_fee, "monthly fee")) return;

    try {
      setSaving(true);
      await axiosInstance.put(
        "dietician/pricing",
        {
          consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
          session_fee: formData.session_fee ? parseFloat(formData.session_fee) : null,
          monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        },
        { withCredentials: true }
      );
      alert("Pricing updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating pricing", error);
      alert("Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="modal">Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Pricing Settings</h2>

        <div className="modal-body">
          <label>Consultation Fee (One-time)</label>
          <input
            type="number"
            name="consultation_fee"
            step="0.01"
            min="0"
            placeholder="e.g., 50.00"
            value={formData.consultation_fee}
            onChange={handleChange}
          />
          <small style={{ color: "#666", fontSize: "0.9em", marginTop: "5px", display: "block", marginBottom: "15px" }}>
            Fee for initial consultation
          </small>

          <label>Session Fee (Per session)</label>
          <input
            type="number"
            name="session_fee"
            step="0.01"
            min="0"
            placeholder="e.g., 75.00"
            value={formData.session_fee}
            onChange={handleChange}
          />
          <small style={{ color: "#666", fontSize: "0.9em", marginTop: "5px", display: "block", marginBottom: "15px" }}>
            Fee per individual session
          </small>

          <label>Monthly Fee (Subscription)</label>
          <input
            type="number"
            name="monthly_fee"
            step="0.01"
            min="0"
            placeholder="e.g., 200.00"
            value={formData.monthly_fee}
            onChange={handleChange}
          />
          <small style={{ color: "#666", fontSize: "0.9em", marginTop: "5px", display: "block" }}>
            Monthly subscription fee
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