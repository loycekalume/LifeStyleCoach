import { useState, useMemo } from "react";
import type { JSX } from "react/jsx-runtime";
import MealLogModal from "../client/logMealModal";
import { useMealLogs } from "../../hooks/useMealLogs"; 
import type { Client } from "../../Services/clientViewService";

interface NutritionCardProps {
  client: Client;
}

export default function NutritionCard({ client }: NutritionCardProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(client)
  // Assuming useMealLogs now returns 'logs' containing the new fields
  const { logs, loading, refetch } = useMealLogs();

  // Daily Goals (Hardcoded for now)
  const GOALS = {
    calories: 2100,
    protein: 150, // grams
    carbs: 250,   // grams
    fats: 70      // grams
  };

  const handleMealAdded = () => {
    console.log("Meal added! Refreshing data...");
    refetch();
  };

  // ✅ Calculate Totals Locally from Logs
  const totals = useMemo(() => {
    return logs.reduce((acc, log: any) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fats: acc.fats + (log.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [logs]);

  const calculateStroke = (current: number, goal: number) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return `${percentage}, 100`;
  };

  return (
    <>
      <div className="card nutrition-card">
        <div className="card-header">
          <h3><i className="fas fa-utensils"></i> Nutrition Today</h3>
          <button className="btn-ghost" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Add Meal
          </button>
        </div>

        <div className="card-content">
          <div className="nutrition-summary">
            
            {/* Main Calories Ring */}
            <div className="calorie-ring">
              <div className="ring-chart">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="circle" 
                    strokeDasharray={calculateStroke(totals.calories, GOALS.calories)} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
                <div className="ring-center">
                  <div className="calories-consumed">{totals.calories.toLocaleString()}</div>
                  <div className="calories-goal">/ {GOALS.calories}</div>
                  <div style={{fontSize:'0.6rem', color:'#888'}}>kcal</div>
                </div>
              </div>
            </div>

            {/* ✅ NEW: Macro Breakdown */}
            <div className="macro-breakdown">
                <MacroItem label="Protein" value={totals.protein} goal={GOALS.protein} color="#3b82f6" />
                <MacroItem label="Carbs" value={totals.carbs} goal={GOALS.carbs} color="#10b981" />
                <MacroItem label="Fats" value={totals.fats} goal={GOALS.fats} color="#f59e0b" />
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
                logs.map((log: any) => (
                  <div className="meal-item" key={log.log_id}>
                    <div className="meal-time-badge">{log.meal_type}</div>
                    <div className="meal-details-col">
                        <div className="meal-description">{log.meal_name}</div>
                        <div className="meal-portion">{log.portion_size}</div>
                    </div>
                    {/* Display Calories & Macros in Log List */}
                    <div className="meal-calories" style={{textAlign:'right'}}>
                        <div style={{fontWeight:'bold'}}>{log.calories} kcal</div>
                        <div style={{fontSize:'0.7rem', color:'#666'}}>
                           {log.protein}p • {log.carbs}c • {log.fats}f
                        </div>
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

// Simple Sub-component for Macros
const MacroItem = ({ label, value, goal, color }: any) => {
    const width = Math.min((value / goal) * 100, 100);
    
    return (
        <div style={{marginBottom:'8px'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'2px'}}>
                <span style={{fontWeight:'600', color:'#444'}}>{label}</span>
                <span style={{color:'#666'}}>{value} / {goal}g</span>
            </div>
            <div style={{width:'100%', height:'6px', background:'#eee', borderRadius:'3px'}}>
                <div style={{
                    width: `${width}%`, 
                    height:'100%', 
                    background: color, 
                    borderRadius:'3px',
                    transition: 'width 0.5s ease'
                }}></div>
            </div>
        </div>
    );
};