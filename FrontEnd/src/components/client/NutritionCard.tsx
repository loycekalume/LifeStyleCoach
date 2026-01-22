import { useState } from "react";
import type { JSX } from "react/jsx-runtime";
import MealLogModal from "../client/logMealModal";
import { useMealLogs } from "../../hooks/useMealLogs"; 

// 1. Import the Client type
import type { Client } from "../../Services/clientViewService";

// 2. Define the interface for the props
interface NutritionCardProps {
  client: Client;
}

// 3. Update the function to accept the props
export default function NutritionCard({ client }: NutritionCardProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(client)
  // Use the hook to get real data
  const { logs, totalCalories, loading, refetch } = useMealLogs();

  // Daily Goal (You can make this dynamic later based on user profile)
  // Example: const DAILY_GOAL = client.target_calories || 2100;
  const DAILY_GOAL = 2100; 

  const handleMealAdded = () => {
    console.log("Meal added! Refreshing data...");
    refetch();
  };

  // Helper to calculate progress ring stroke
  const calculateStroke = (current: number, goal: number) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return `${percentage}, 100`;
  };

  return (
    <>
      <div className="card nutrition-card">
        <div className="card-header">
          <h3>
            <i className="fas fa-utensils"></i> Nutrition Today
          </h3>
          <button 
            className="btn-ghost" 
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus"></i> Add Meal
          </button>
        </div>

        <div className="card-content">
          <div className="nutrition-summary">
            {/* Circular Progress Chart */}
            <div className="calorie-ring">
              <div className="ring-chart">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={calculateStroke(totalCalories, DAILY_GOAL)}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="ring-center">
                  <div className="calories-consumed">{totalCalories.toLocaleString()}</div>
                  <div className="calories-goal">/ {DAILY_GOAL.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="macro-breakdown">
                {/* Macro placeholders */}
            </div>
          </div>

          <div className="recent-meals-section">
            <h4>Today's Logs</h4>
            
            <div className="recent-meals">
              {loading ? (
                 <div className="loading-state">Loading history...</div>
              ) : logs.length === 0 ? (
                 <div className="empty-logs">
                    <i className="fas fa-carrot"></i>
                    <p>No meals logged yet today.</p>
                 </div>
              ) : (
                logs.map((log) => (
                  <div className="meal-item" key={log.log_id}>
                    <div className="meal-time-badge">{log.meal_type}</div>
                    
                    <div className="meal-details-col">
                        <div className="meal-description">{log.meal_name}</div>
                        <div className="meal-portion">{log.portion_size}</div>
                    </div>

                    <div className="meal-calories">
                        {log.calories} <span>cal</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <MealLogModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMealAdded}
      />
    </>
  );
}