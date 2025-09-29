import React, { useEffect, useState } from "react";

interface PricingOption {
  pricing_id: number;
  session_type: string;
  price: number;
  unit: string;
}

const PricingCard: React.FC<{ instructorId: number }> = ({ instructorId }) => {
  const [pricing, setPricing] = useState<PricingOption[]>([]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/pricing`);
        const json = await res.json();
        setPricing(json);
      } catch (error) {
        console.error("Error fetching pricing:", error);
      }
    };

    fetchPricing();
  }, [instructorId]);

  return (
    <div className="card pricing-card">
      <div className="card-header">
        <h3><i className="fas fa-dollar-sign"></i> Session Pricing</h3>
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
    </div>
  );
};

export default PricingCard;
