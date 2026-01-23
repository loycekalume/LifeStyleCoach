import { useState } from "react";
import { useModal } from '../../../contexts/modalContext';
// 👇 Import the modal we created
import AssignMealModal from './assignMealPlanModal'; 

export interface MealPlan {
    meal_plan_id: number;
    title: string;
    category: string;
    description: string;
    calories: string;
    clientsCount?: number;
    favorite?: boolean;
    is_favorite: boolean;
}

interface MealPlanCardProps {
    plan: MealPlan;
    onUpdate: (id: number, updates: Partial<MealPlan>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export default function MealPlanCard({ plan, onUpdate, onDelete }: MealPlanCardProps) {
    const { openEditModal } = useModal();
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);

    const handleFavoriteToggle = () => {
        onUpdate(plan.meal_plan_id, { is_favorite: !plan.favorite });  // ✅ Changed
    };

    // ✅ Add this debug log
    const handleAssignClick = () => {
        console.log("[CARD] Opening assign modal for plan:", {
            meal_plan_id: plan.meal_plan_id,
            title: plan.title
        });
        setAssignModalOpen(true);
    };

    return (
        <>
            <div className="card-content" style={{ marginBottom: '20px', background: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div className="meal-plan-grid">
                    <div className="meal-plan-item">
                        <div className="plan-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div className={`plan-category ${plan.category.toLowerCase().replace(/\s/g, '-')}`}>
                                {plan.category}
                            </div>
                            <button 
                                className={`plan-favorite ${plan.favorite ? "active" : ""}`} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: plan.favorite ? '#e74c3c' : '#ccc' }}
                                onClick={handleFavoriteToggle}
                            >
                                <i className={plan.favorite ? "fas fa-heart" : "far fa-heart"}></i>
                            </button>
                        </div>

                        <h4 className="plan-title" style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{plan.title}</h4>
                        <p className="plan-description" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>{plan.description}</p>

                        <div className="plan-stats" style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#888', fontSize: '0.85rem' }}>
                            <div className="plan-stat">
                                <i className="fas fa-fire" style={{ marginRight: '5px' }}></i>
                                <span>{plan.calories}</span>
                            </div>
                            {plan.clientsCount !== undefined && (
                                <div className="plan-stat">
                                    <i className="fas fa-users" style={{ marginRight: '5px' }}></i>
                                    <span>{plan.clientsCount} clients</span>
                                </div>
                            )}
                        </div>

                        <div className="plan-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn1 btn-outline1 btn-sm" 
                                style={{ flex: 1 }}
                                onClick={() => openEditModal(plan)}
                            >
                                Edit
                            </button>
                            <button 
                                className="btn1 btn-outline1 btn-sm" 
                                style={{ flex: 0, padding: '8px 12px', color: '#e74c3c' }}
                                onClick={() => onDelete(plan.meal_plan_id)}  // ✅ Changed
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                            
                            <button 
                                className="btn btn-primary1 btn-sm" 
                                style={{ flex: 1 }}
                                onClick={handleAssignClick}  // ✅ Changed to use the handler
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Pass meal_plan_id instead of id */}
            <AssignMealModal 
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                mealPlanTitle={plan.title}
                mealPlanId={plan.meal_plan_id}  // ✅ Changed from plan.id
            />
        </>
    );
}