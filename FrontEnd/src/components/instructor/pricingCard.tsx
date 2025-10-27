import React, { useEffect, useState } from "react";

interface PricingOption {
  pricing_id: number;
  session_type: string;
  price: number;
  unit: string;
}

// ✅ Component accepts no props, relying entirely on localStorage
const PricingCard: React.FC = () => {
  const [pricing, setPricing] = useState<PricingOption[]>([]);
  const [instructorId, setInstructorId] = useState<number | null>(null); // State for dynamic ID
  const [loading, setLoading] = useState(true);


  // 1. Fetch the dynamic instructorId from localStorage on mount
  useEffect(() => {
    // Reads the specific instructorId set by the Login controller
    const storedId = localStorage.getItem("instructorId");
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    } else {
        setLoading(false); // If no ID (not logged in or profile not set), stop loading
    }
  }, []);

  // 2. Fetch data only when instructorId is available
  useEffect(() => {
    if (instructorId === null) return;
    setLoading(true);

    const fetchPricing = async () => {
      try {
        // Uses the dynamic instructorId state
        const res = await fetch(`http://localhost:3000/instructors/${instructorId}/pricing`);
        
        if (!res.ok && res.status !== 404) {
            throw new Error(`Failed to fetch pricing (Status: ${res.status})`);
        }
        
        const json = await res.json();
        setPricing(json || []);
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricing([]);
      } finally {
        setLoading(false);
    }
    };

    fetchPricing();
  }, [instructorId]); // Depend on the dynamic ID

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
