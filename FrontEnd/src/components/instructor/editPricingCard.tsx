import React, { useState } from "react";

interface PricingOption {
  pricing_id: number;
  session_type: string;
  price: number;
  unit: string;
}

interface EditPricingModalProps {
  initialPricing: PricingOption[];
  onSave: (updatedPricing: PricingOption[]) => void;
  onClose: () => void;
}

const EditPricingModal: React.FC<EditPricingModalProps> = ({ initialPricing, onSave, onClose }) => {
  const [pricingData, setPricingData] = useState<PricingOption[]>(initialPricing);

  const handleChange = (index: number, field: keyof PricingOption, value: string | number) => {
    const updated = [...pricingData];
    updated[index] = { ...updated[index], [field]: value };
    setPricingData(updated);
  };

  const handleSave = () => {
    onSave(pricingData);
  };

  return (
    <div className="modal-backdropt">
      <div className="modal-cardt">
        <h3>Edit Pricing</h3>
        {pricingData.map((item, idx) => (
          <div key={item.pricing_id} className="pricing-edit-row">
            <input
              type="text"
              value={item.session_type}
              onChange={(e) => handleChange(idx, "session_type", e.target.value)}
              placeholder="Session Type"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleChange(idx, "price", Number(e.target.value))}
              placeholder="Price"
            />
            <input
              type="text"
              value={item.unit}
              onChange={(e) => handleChange(idx, "unit", e.target.value)}
              placeholder="Unit (e.g. hour)"
            />
          </div>
        ))}

        <div className="modal-actionst">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditPricingModal;
