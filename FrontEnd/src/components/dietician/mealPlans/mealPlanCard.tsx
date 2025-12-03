

export interface MealPlan {
    id: number;
    title: string;
    category: string;
    description: string;
    calories: string;
    clientsCount: number;
    favorite?: boolean;
}

interface MealPlanCardProps {
    plan: MealPlan;
}

export default function MealPlanCard({ plan }: MealPlanCardProps) {
    return (
        <div className="card-content">
            <div className="meal-plan-grid">
                <div className="meal-plan-item">
                    <div className="plan-header">
                        <div className={`plan-category ${plan.category.toLowerCase().replace(/\s/g, '-')}`}>
                            {plan.category}
                        </div>
                        <button className={`plan-favorite ${plan.favorite ? "active" : ""}`}>
                            <i className="fas fa-heart"></i>
                        </button>
                    </div>

                    <h4 className="plan-title">{plan.title}</h4>
                    <p className="plan-description">{plan.description}</p>

                    <div className="plan-stats">
                        <div className="plan-stat">
                            <i className="fas fa-fire"></i>
                            <span>{plan.calories}</span>
                        </div>
                        <div className="plan-stat">
                            <i className="fas fa-users"></i>
                            <span>{plan.clientsCount} clients</span>
                        </div>
                    </div>

                    <div className="plan-actions">
                        <button className="btn1 btn-outline1 btn-sm">Edit</button>
                        <button className="btn btn-primary1 btn-sm">Assign</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
