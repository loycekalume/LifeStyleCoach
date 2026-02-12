import React, { useEffect, useState } from "react";
import EditPricingModal from "./editPricingCard";
import axiosInstance from "../../utils/axiosInstance"; 

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

  // ✅ Fetch pricing info (Refactored to use axiosInstance)
  useEffect(() => {
    if (instructorId === null) return;
    setLoading(true);

    const fetchPricing = async () => {
      try {
        // No need for http://localhost:3000, axiosInstance handles baseURL
        const res = await axiosInstance.get(`/instructors/${instructorId}/pricing`);
        
        // Axios puts the JSON response directly in res.data
        setPricing(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricing([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [instructorId]);

  // ✅ Handle saving updates (Refactored to use axiosInstance)
  const handleSave = async (updatedPricing: PricingOption[]) => {
    try {
      // Create an array of update promises to run them efficiently
      const updatePromises = updatedPricing.map((item) => 
        axiosInstance.put(`/instructors/pricing/${item.pricing_id}`, item)
      );

      // Wait for all updates to finish
      const responses = await Promise.all(updatePromises);

      // Update local state based on results
      const newPricingData = responses.map(res => res.data.pricing);
      
      setPricing((prev) => {
        // Map over previous state and replace updated items
        return prev.map(p => {
          const updated = newPricingData.find((u: PricingOption) => u.pricing_id === p.pricing_id);
          return updated || p;
        });
      });

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
                  ksh {item.price}/{item.unit}
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