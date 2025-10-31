import React, { useEffect, useState } from "react";
import EditPricingModal from "./editPricingCard";

interface PricingOption {
  pricing_id: number;
  session_type: string;
  price: number;
  unit: string;
}

const PricingCard: React.FC = () => {
  const [pricing, setPricing] = useState<PricingOption[]>([]);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch instructorId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("instructorId");
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch pricing info
  useEffect(() => {
    if (instructorId === null) return;
    setLoading(true);

    const fetchPricing = async () => {
      try {
        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/pricing`);
        if (!res.ok && res.status !== 404) throw new Error(`Failed to fetch pricing (Status: ${res.status})`);

        const json = await res.json();
        setPricing(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricing([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [instructorId]);

  // Handle saving updates
  const handleSave = async (updatedPricing: PricingOption[]) => {
    try {
      for (const item of updatedPricing) {
        const res = await fetch(`http://localhost:3000/instructors/pricing/${item.pricing_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!res.ok) throw new Error(`Failed to update pricing for ${item.session_type}`);

        const result = await res.json();
        const updated = result.pricing;

        // Update the state for that one pricing row
        setPricing((prev) =>
          prev.map((p) => (p.pricing_id === updated.pricing_id ? updated : p))
        );
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating pricing:", err);
      alert("Failed to update pricing");
    }
  };

  if (loading) {
    return (
      <div className="card pricing-card">
        <div className="card-header">
          <h3><i className="fas fa-dollar-sign"></i> Session Pricing</h3>
        </div>
        <div className="card-content">
          <p>Loading pricing options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card pricing-card">
      <div className="card-header">
        <h3><i className="fas fa-dollar-sign"></i> Session Pricing</h3>
        <button
          className="edit-icon"
          onClick={() => setIsEditing(true)}
          title="Edit pricing"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="card-content">
        <div className="pricing-list">
          {pricing.length > 0 ? (
            pricing.map((item) => (
              <div key={item.pricing_id} className="pricing-item">
                <span>{item.session_type}</span>
                <span className="price">
                  ${item.price}/{item.unit}
                </span>
              </div>
            ))
          ) : (
            <p>No pricing available</p>
          )}
        </div>
      </div>

      {isEditing && (
        <EditPricingModal
          initialPricing={pricing}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default PricingCard;
