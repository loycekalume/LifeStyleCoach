import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaFireAlt, FaClock, FaUserMd, FaUtensils, FaCarrot, FaAppleAlt, FaArrowLeft } from "react-icons/fa";
import "../../styles/mealPlanDetails.css"; 

interface MealPlanDetailsProps {
  planId: number;
  onBack: () => void;
}

interface MealItem {
  item_id: number;
  meal_type: string;
  food_name: string;  
  calories: number;   
  portion?: string;
}

interface PlanDetails {
  meal_plan_id: number;
  title: string;
  category: string;
  description: string;
  dietician_name: string;
  custom_notes: string;
}

export default function MealPlanDetails({ planId, onBack }: MealPlanDetailsProps) {
  const [activePlan, setActivePlan] = useState<PlanDetails | null>(null);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        console.log("Fetching plan details for ID:", planId); 
        const detailsRes = await axiosInstance.get(`/client/plans/${planId}/details`);
        console.log("Received data:", detailsRes.data); 
        
        setActivePlan(detailsRes.data.plan);
        setMealItems(detailsRes.data.items);
      } catch (err) {
        console.error("Error loading plan details", err);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  // Calculate Total Calories
  const totalCalories = mealItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);

  // Group items by meal type
  const groupedMeals = {
    Breakfast: mealItems.filter(i => i.meal_type === 'Breakfast'),
    Lunch: mealItems.filter(i => i.meal_type === 'Lunch'),
    Snack: mealItems.filter(i => i.meal_type === 'Snack'),
    Dinner: mealItems.filter(i => i.meal_type === 'Dinner'),
  };

  if (loading) return <div className="cp-loading">Loading full nutrition plan...</div>;

  if (!activePlan) return <div className="cp-empty">Plan not found.</div>;

  return (
    <div className="nutrition-page">
      {/* Back Button */}
      <button onClick={onBack} className="mp-back-btn">
        <FaArrowLeft /> Back to All Plans
      </button>

      {/* Hero Section */}
      <div className="plan-hero">
        <div className="plan-hero-content">
          <span className="plan-badge">{activePlan.category}</span>
          <h1>{activePlan.title}</h1>
          
          <div className="plan-meta">
            <div className="meta-item">
              <FaUserMd /> 
              <span>Plan by {activePlan.dietician_name}</span>
            </div>
            <div className="meta-item highlight">
              <FaFireAlt /> 
              <span>{totalCalories > 0 ? totalCalories : 'N/A'} kcal / day</span>
            </div>
          </div>

          {activePlan.custom_notes && (
            <div className="dietician-note-box">
              <strong>Note from Dietician:</strong>
              <p>"{activePlan.custom_notes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="meals-timeline">
        {Object.entries(groupedMeals).map(([type, items]) => {
          if (items.length === 0) return null;
          
          return (
            <div key={type} className="meal-section">
              <div className="meal-section-header">
                <div className={`meal-icon-circle ${type.toLowerCase()}`}>
                  {type === 'Breakfast' && <FaClock />} 
                  {type === 'Lunch' && <FaUtensils />} 
                  {type === 'Snack' && <FaAppleAlt />} 
                  {type === 'Dinner' && <FaCarrot />} 
                </div>
                <h2>{type}</h2>
              </div>

              <div className="meal-cards-grid">
                {items.map((item) => (
                  <div key={item.item_id} className="food-item-card">
                    <div className="food-info">
                      <h4>{item.food_name}</h4>  {/* ✅ Fixed */}
                      {item.portion && <span className="portion">{item.portion}</span>}
                    </div>
                    <div className="food-cals">
                      {item.calories} kcal
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}