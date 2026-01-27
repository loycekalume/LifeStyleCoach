import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaLeaf, FaFireAlt, FaCheck, FaUtensils, FaMugHot, FaCloudMoon, FaCookieBite, FaArrowRight } from "react-icons/fa";
import "../../styles/assignedMealPlans.css"; 
import type { Client } from "../../Services/clientViewService";

interface AssignedMealCardProps {
  client: Client;
}

interface AssignedMeal {
  id: number;
  type: string;
  name: string;
  calories?: string;
  status: 'pending' | 'logged';
}

export default function AssignedMealCard({ client }: AssignedMealCardProps) {
  const [meals, setMeals] = useState<AssignedMeal[]>([]);
  const [planTitle, setPlanTitle] = useState<string>("");
  const [totalCalories, setTotalCalories] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  console.log(client)
  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const res = await axiosInstance.get("/client/my-plans");
        const activePlans = res.data.plans;

        if (activePlans && activePlans.length > 0) {
          const currentPlan = activePlans[0];
          setPlanTitle(currentPlan.title);
          setTotalCalories(currentPlan.calories);
          setMeals(parseDescriptionToMeals(currentPlan.description));
        }
      } catch (err) {
        console.error("Failed to load active plan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivePlan();
  }, []);

  const parseDescriptionToMeals = (description: string): AssignedMeal[] => {
    if (!description) return [];
    return description.split('\n').filter(line => line.trim().length > 0).map((line, index) => {
      let type = "Snack";
      let name = line;

      if (line.match(/Breakfast/i)) { type = "Breakfast"; name = line.replace(/Breakfast:?/i, "").trim(); }
      else if (line.match(/Lunch/i)) { type = "Lunch"; name = line.replace(/Lunch:?/i, "").trim(); }
      else if (line.match(/Dinner/i)) { type = "Dinner"; name = line.replace(/Dinner:?/i, "").trim(); }
      
      return { id: index, type, name: name || line, status: 'pending' };
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Breakfast': return <FaMugHot />;
      case 'Lunch': return <FaUtensils />;
      case 'Dinner': return <FaCloudMoon />;
      default: return <FaCookieBite />;
    }
  };

  const handleLogMeal = (id: number) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, status: 'logged' } : m));
  };

  return (
    <div className="assigned-meal-card">
      {/* Header */}
      <div className="am-header">
        <div className="am-header-title">
          <div className="am-icon-box"><FaLeaf /></div>
          <div>
            <h3>Today's Menu</h3>
            {!loading && planTitle && <span className="am-subtitle">{planTitle}</span>}
          </div>
        </div>
        
        {totalCalories && (
           <div className="am-calories-badge">
             <FaFireAlt /> {totalCalories}
           </div>
        )}
      </div>

      <div className="am-content">
        {loading ? (
          <div className="am-loading">
            <div className="am-spinner"></div>
            <p>Curating your menu...</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="am-empty">
            <FaUtensils size={30} color="#cbd5e0" />
            <p>No active plan assigned.</p>
            <span>Ask your dietician to assign a meal plan.</span>
          </div>
        ) : (
          <div className="am-list">
            {meals.map((item) => (
              <div key={item.id} className={`am-item ${item.status}`}>
                <div className={`am-item-icon ${item.type.toLowerCase()}`}>
                  {getIcon(item.type)}
                </div>
                
                <div className="am-item-info">
                  <span className="am-type">{item.type}</span>
                  <span className="am-name">{item.name}</span>
                </div>

                <div className="am-item-action">
                  {item.status === 'pending' ? (
                    <button onClick={() => handleLogMeal(item.id)} className="am-btn-eat">
                      Eat
                    </button>
                  ) : (
                    <span className="am-logged-text"><FaCheck /> Logged</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="am-footer">
        <button onClick={() => navigate('/nutrition')} className="am-view-all">
          View Full Plan <FaArrowRight style={{marginLeft: '6px', fontSize: '12px'}} />
        </button>
      </div>
    </div>
  );
}