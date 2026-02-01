import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import type { Client } from "../../Services/clientViewService";
import { FaFire, FaTrophy, FaCheckCircle, FaUtensils, FaDumbbell } from "react-icons/fa";
import "./GoalsCard.css";

interface GoalsCardProps {
  client: Client;
}

interface AutoGoal {
  goal_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'active' | 'completed';
  icon_type: 'food' | 'fitness';
}

const GoalsCard: React.FC<GoalsCardProps> = ({ client }) => {
  const [goals, setGoals] = useState<AutoGoal[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 1. Define the fetch function
  const fetchData = useCallback(async () => {
      try {
        const res = await axiosInstance.get("/client/goals/");
        setGoals(res.data.goals || []);
        setStreak(res.data.streak || 0);
      } catch (err) {
        console.error("Failed to load goals", err);
      } finally {
        setLoading(false);
      }
  }, []);

  // 2. Set up Event Listeners
  useEffect(() => {
    fetchData(); // Fetch immediately on load

    // This function runs whenever the hook says "mealLogged"
    const handleRefresh = () => {
        console.log("🔄 Activity detected! Refreshing goals...");
        fetchData();
    };

    // ✅ Start Listening
    window.addEventListener('mealLogged', handleRefresh);
    window.addEventListener('workoutLogged', handleRefresh);

    // ✅ Cleanup (Stop listening when leaving page)
    return () => {
        window.removeEventListener('mealLogged', handleRefresh);
        window.removeEventListener('workoutLogged', handleRefresh);
    };
  }, [fetchData]);

  return (
    <div className="card goals-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-bullseye"></i> Weekly Consistency
        </h3>
        {/* Unified Streak Badge */}
        <div className="streak-badge" title="Consecutive days with any activity logged">
            <FaFire className={streak > 0 ? "streak-fire active" : "streak-fire"} />
            <span>{streak} Day Streak</span>
        </div>
      </div>

      <div className="card-content">
        <div className="goals-list">

          {/* Primary Weight Goal */}
          <div className="goal-item primary-goal">
             <div className="goal-info">
               <span className="goal-tag">Long Term Goal</span>
               <span className="goal-title" style={{fontSize: '1rem'}}>
                  {client.weight_goal ? client.weight_goal.toUpperCase() : "HEALTHY LIVING"}
               </span>
             </div>
          </div>

          {/* Dynamic Auto-Calculated Goals */}
          {loading ? (
             <div className="loading-goals">Checking logs...</div>
          ) : (
             goals.map((goal) => {
               const percent = Math.min((goal.current_value / goal.target_value) * 100, 100);
               
               return (
                 <div key={goal.goal_id} className={`goal-item ${goal.status === 'completed' ? 'completed' : ''}`}>
                    
                    <div className="goal-icon-col">
                         {goal.icon_type === 'food' ? <FaUtensils /> : <FaDumbbell />}
                    </div>

                    <div className="goal-info">
                      <div className="goal-title">{goal.title}</div>
                      
                      {goal.status === 'completed' ? (
                         <div className="goal-achievement">
                           <FaTrophy /> <span>Perfect Week!</span>
                         </div>
                      ) : (
                         <div className="goal-progress">
                           <div className="progress-bar">
                             <div 
                                className="progress-fill" 
                                style={{ 
                                    width: `${percent}%`,
                                    background: goal.icon_type === 'food' ? '#10b981' : '#f59e0b' 
                                }}
                             ></div>
                           </div>
                           <span style={{fontSize:'0.8rem', color:'#666'}}>
                               {goal.current_value} / {goal.target_value} days (Last 7 Days)
                           </span>
                         </div>
                      )}
                    </div>
                    
                    {/* Status Checkmark */}
                    <div className="goal-action">
                       {goal.status === 'completed' 
                          ? <FaCheckCircle color="#10b981" size={20} /> 
                          : <span className="status-dot"></span>}
                    </div>
                 </div>
               );
             })
          )}

        </div>
      </div>
    </div>
  );
};

export default GoalsCard;