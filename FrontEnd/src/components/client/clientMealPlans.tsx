import  { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaUtensils, FaLeaf } from "react-icons/fa";
import MealPlanCard from "./assignedMealCard"; 

interface ClientMealPlansProps {
  onPlanSelect: (id: number) => void;
}

export default function ClientMealPlans({ onPlanSelect }: ClientMealPlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosInstance.get("/client/my-plans");
        setPlans(res.data.plans || []);
      } catch (err) {
        console.error("Error loading plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>Loading plans...</div>;

  return (
    <div className="client-plans-list">
      {/* Header */}
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#1e293b", display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaLeaf style={{ color: "#10b981" }} /> My Meal Plans
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Select a plan to view the full menu and ingredients.</p>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", border: "1px dashed #cbd5e0", borderRadius: "12px" }}>
          <FaUtensils size={30} color="#cbd5e0" />
          <p style={{ color: "#94a3b8" }}>No active plans assigned yet.</p>
        </div>
      ) : (
        /* The Grid */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          {plans.map((plan) => (
            <MealPlanCard 
              key={plan.meal_plan_id} 
              plan={plan} 
              onView={(id) => onPlanSelect(id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}