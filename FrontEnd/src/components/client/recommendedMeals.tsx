import React from "react";
// Removed useNavigate since we are going back to AI generation
import { useMeals } from "../../hooks/useMeals";
import "../../styles/mealCard.css"; 

// 1. Keep Client Type to prevent Dashboard errors
import type { Client } from "../../Services/clientViewService";

// 2. Keep Interface
interface MealRecommendationCardProps {
  client: Client;
}

// 3. Component
export default function MealRecommendationCard({ client }: MealRecommendationCardProps): React.JSX.Element {
  // usage of generatePlan from the hook
  const { meals, loading, generating, error, generatePlan, logMeal, location } = useMeals();
console.log(client)
  const getIcon = (type: string): string => {
    switch(type) {
      case 'Breakfast': return 'fa-mug-hot';
      case 'Lunch': return 'fa-utensils';
      case 'Dinner': return 'fa-moon';
      case 'Snack': return 'fa-cookie-bite';
      default: return 'fa-apple-alt';
    }
  };

  return (
    <div className="card meal-card">
      {/* Header Section */}
      <div className="meal-card-header">
        <div className="header-text-group">
            <h3>
                <div className="icon-badge main-icon">
                    <i className="fas fa-leaf"></i>
                </div>
                Today's Nutrition
            </h3>
            
            {/* Location Sub-header */}
            {!loading && location && (
                <div className="location-subtitle">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{location}  Meal Suggestions</span>
                </div>
            )}
        </div>
        
        {/* ✅ RESTORED BUTTON: AI Generate Plan */}
        {meals.length === 0 && !loading && !generating && (
          <button 
            onClick={generatePlan} 
            className="btn-generate"
          >
            <i className="fas fa-magic"></i> Generate Plan
          </button>
        )}
      </div>

      <div className="meal-card-content">
        
        {/* Loading State */}
        {loading && (
          <div className="state-message">
            <div className="spinner"></div>
            <p>Loading your plan...</p>
          </div>
        )}
        
        {/* Generating AI State */}
        {generating && (
          <div className="state-message ai-generating">
            <i className="fas fa-robot fa-bounce"></i>
            <p>Curating local meals for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !generating && meals.length === 0 && !error && (
          <div className="empty-state">
            <i className="fas fa-utensils"></i>
            <p>No meals planned yet.</p>
            {/* Restored Original Text */}
            <span>Tap "Generate" to get a location-based plan.</span>
          </div>
        )}

        {/* The Meal List */}
        <div className="meal-list">
          {meals.map((item) => (
            <div 
              className={`meal-item ${item.status === 'logged' ? 'is-logged' : ''}`} 
              key={item.recommendation_id}
            >
              
              {/* Left: Icon */}
              <div className="meal-icon-wrapper">
                <i className={`fas ${item.status === 'logged' ? 'fa-check' : getIcon(item.meal_type)}`}></i>
              </div>
              
              {/* Middle: Info */}
              <div className="meal-info">
                <div className="meal-type">{item.meal_type}</div>
                <div className="meal-name">{item.meal_name}</div>
                <div className="meal-reason">
                  <i className="fas fa-info-circle"></i> {item.reason}
                </div>
              </div>

              {/* Right: Stats & Action */}
              <div className="meal-actions">
                <span className="calories-badge">
                  <i className="fas fa-fire-alt"></i> {item.calories}
                </span>
                
                {item.status === 'pending' && (
                  <button 
                    onClick={() => logMeal(item.recommendation_id)}
                    className="btn-eat"
                  >
                    Eat
                  </button>
                )}
                
                {item.status === 'logged' && (
                  <span className="status-logged">Logged</span>
                )}
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}