import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Types (Match your DB/Backend) ---
interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image_url?: string;
  category: string;
}

interface MealPlan {
  totalCalories: number;
  totalProtein: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal | null;
  };
}

const ClientMealPlans: React.FC = () => {
  // Hardcoded ID for now (matches your previous context), replace with real auth ID later
  const userId = 26; 

  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Fetch Recommendation ---
  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/mealPlans/generate/${userId}`);
      setPlan(response.data);
    } catch (err) {
      console.error("Failed to load plan", err);
      setError("Could not generate a plan. Make sure you have enough meals in the database!");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchRecommendation();
  }, []);

  // --- 2. Save Plan Handler ---
  const handleSavePlan = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await axios.post('http://localhost:3000/mealPlans/save', {
        userId,
        planName: `Plan for ${new Date().toLocaleDateString()}`,
        totalCalories: plan.totalCalories,
        meals: plan.meals // Sends the whole object {breakfast:..., lunch:...}
      });
      alert("Meal plan saved successfully!");
    } catch (err) {
      alert("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  // --- 3. Log Meal Handler (Placeholder) ---
  const handleLogMeal = () => {
    // You can hook this up to a modal or form later
    alert("Open Log Meal Modal: Coming Soon!");
  };

  if (loading) return <div className="p-4">Generating your perfect diet... 🥗</div>;
  if (error) return <div className="p-4 text-red-500">{error} <button onClick={fetchRecommendation}>Try Again</button></div>;

  return (
    <div className="meal-plans-container">
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Recommended for You</h2>
          <p style={{ color: '#666' }}>Based on your caloric needs (~2000 kcal)</p>
        </div>
        <button 
          className="action-btn"
          onClick={handleLogMeal}
          style={{ 
            backgroundColor: '#FF6B6B', color: 'white', padding: '10px 20px', 
            borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
          Log a Meal
        </button>
      </div>

      {/* Stats Summary Card */}
      {plan && (
        <div style={{ 
          background: '#f0f9ff', padding: '20px', borderRadius: '12px', 
          marginBottom: '30px', border: '1px solid #bae6fd',
          display: 'flex', justifyContent: 'space-around' 
        }}>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>
              {plan.totalCalories}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>Total Calories</span>
          </div>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>
              {plan.totalProtein}g
            </span>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>Protein</span>
          </div>
           {/* Add Carbs/Fats logic here if you want */}
        </div>
      )}

      {/* Meal Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {plan && Object.entries(plan.meals).map(([slot, meal]) => (
          meal ? (
            <MealCard key={slot} slot={slot} meal={meal} />
          ) : null
        ))}
      </div>

      {/* Footer Actions */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <button 
          onClick={fetchRecommendation}
          style={{ 
            padding: '12px 24px', background: '#e2e8f0', border: 'none', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
          }}
        >
          <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i>
          Regenerate Plan
        </button>

        <button 
          onClick={handleSavePlan} 
          disabled={saving}
          style={{ 
            padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
          }}
        >
          {saving ? 'Saving...' : 'Save to My Plans'}
        </button>
      </div>
    </div>
  );
};

// --- Sub-Component for Individual Meal Cards ---
const MealCard = ({ slot, meal }: { slot: string, meal: Meal }) => (
  <div style={{ 
    background: 'white', borderRadius: '12px', overflow: 'hidden', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb'
  }}>
    <div style={{ height: '150px', background: '#ddd', position: 'relative' }}>
      {/* Placeholder Image Logic */}
      <img 
        src={meal.image_url || "https://placehold.co/600x400?text=Healthy+Food"} 
        alt={meal.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <span style={{ 
        position: 'absolute', top: '10px', left: '10px', 
        background: 'rgba(0,0,0,0.7)', color: 'white', 
        padding: '4px 10px', borderRadius: '20px', textTransform: 'capitalize', fontSize: '0.8rem' 
      }}>
        {slot}
      </span>
    </div>
    
    <div style={{ padding: '15px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>{meal.name}</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555' }}>
        <span>🔥 {meal.calories} kcal</span>
        <span>🥩 {meal.protein}g P</span>
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
        {/* Simple tags logic */}
        <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px' }}>
          Recommended
        </span>
      </div>
    </div>
  </div>
);

export default ClientMealPlans;