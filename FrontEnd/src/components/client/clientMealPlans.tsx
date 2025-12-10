import { useEffect, useState } from "react";
import { FaUtensils, FaLeaf, FaFire, FaCalendarAlt, FaUserMd, FaInfoCircle } from "react-icons/fa";

interface AssignedMealPlan {
  assignment_id: number;
  title: string;
  category: string;
  description: string;
  calories: string;
  dietician_name: string;
  dietician_notes: string;
  start_date: string;
  status: string;
}

export default function ClientMealPlans() {
  const [plans, setPlans] = useState<AssignedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPlans() {
      const userId = localStorage.getItem("userId") || "13"; // Default fallback
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your meal plans.");
        setLoading(false);
        return;
      }

      try {
        // ✅ FETCHING FROM: /api/meal-plans/client/:clientId
        const res = await fetch(`http://localhost:3000/meal-plans/client/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`, //  Sends the token
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (res.ok) {
          setPlans(data.plans || []); // Access .plans from the controller response
        } else {
          console.error("Failed to fetch:", data.message);
          // Optional: handle specific error messages
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Could not load meal plans.");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) return <div className="p-4" style={{textAlign:'center', color:'#666'}}>Loading your nutrition plan...</div>;
  if (error) return <div className="p-4" style={{textAlign:'center', color:'red'}}>{error}</div>;

  return (
    <div className="client-meal-plans" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#333", borderBottom: "2px solid #4CAF50", display: "inline-block", paddingBottom: "5px" }}>
        My Nutrition Plans
      </h2>
      
      {plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "10px" }}>
          <FaUtensils size={40} color="#ccc" />
          <p style={{ color: "#666", marginTop: "10px" }}>No meal plans assigned yet.</p>
        </div>
      ) : (
        plans.map((plan) => (
          <div key={plan.assignment_id} style={{
            background: "white", 
            borderRadius: "12px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)", 
            marginBottom: "2rem", 
            overflow: "hidden",
            borderLeft: "6px solid #4CAF50"
          }}>
            
            {/* Header */}
            <div style={{ background: "#f1f8e9", padding: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  {plan.title}
                  <span style={{ fontSize: "0.8rem", background: "#4CAF50", color: "white", padding: "2px 8px", borderRadius: "12px" }}>
                    {plan.category}
                  </span>
                </h3>
                <div style={{ fontSize: "0.9rem", color: "#558b2f", marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                   <FaUserMd /> Assigned by Dietician {plan.dietician_name}
                </div>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "bold", color: "#e65100", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                  <FaFire /> {plan.calories} kcal
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "5px" }}>
                  <FaCalendarAlt /> Starts: {new Date(plan.start_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "25px" }}>
              <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>{plan.description}</p>
              
              {plan.dietician_notes && (
                <div style={{ 
                  background: "#fff3e0", 
                  padding: "15px", 
                  borderRadius: "8px", 
                  border: "1px dashed #ffb74d",
                  display: "flex",
                  gap: "10px"
                }}>
                  <FaInfoCircle color="#f57c00" style={{ marginTop: "3px" }} />
                  <div>
                    <strong style={{ color: "#e65100", display: "block", marginBottom: "3px" }}>Note from Dietician:</strong>
                    <span style={{ color: "#444" }}>{plan.dietician_notes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ padding: "15px 25px", background: "#fafafa", borderTop: "1px solid #eee", textAlign: "right" }}>
              <button style={{ 
                background: "#4CAF50", 
                color: "white", 
                border: "none", 
                padding: "10px 20px", 
                borderRadius: "6px", 
                cursor: "pointer",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <FaLeaf /> View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}