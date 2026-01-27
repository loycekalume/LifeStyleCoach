
import { FaFireAlt, FaRegHeart, FaChevronRight } from "react-icons/fa";
import "../../styles/assignedMealCard.css"; 

interface MealPlanCardProps {
  plan: {
    meal_plan_id: number;
    title: string;
    category: string;
    calories: string;
    description: string;
  };
  onView: (id: number) => void;
}

export default function MealPlanCard({ plan, onView }: MealPlanCardProps) {
  return (
    <div className="mp-card">
      <div className="mp-card-header">
        <span className="mp-category">{plan.category}</span>
        <button className="mp-heart-btn"><FaRegHeart /></button>
      </div>

      <div className="mp-card-body">
        <h3 className="mp-title">{plan.title}</h3>
        <p className="mp-desc">{plan.description}</p>
        
        {/* Calories Icon */}
        <div className="mp-meta">
          <FaFireAlt className="mp-fire-icon" />
          {/* If calories are not in the main table, you might need to pass them or hide this */}
          {plan.calories && <span>{plan.calories}</span>} 
        </div>
      </div>

      <div className="mp-card-actions">
        {/* We replaced Edit/Assign with "View Plan" for the client side */}
        <button 
          className="mp-btn mp-btn-view"
          onClick={() => onView(plan.meal_plan_id)}
        >
          View Full Plan <FaChevronRight style={{fontSize: '0.8em', marginLeft: '5px'}}/>
        </button>
      </div>
    </div>
  );
}