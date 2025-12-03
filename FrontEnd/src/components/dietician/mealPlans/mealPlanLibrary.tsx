
import MealPlanCard from "./mealPlanCard";
import type { MealPlan } from "./mealPlanCard"

export default function MealPlanLibrary() {
    const mealPlans: MealPlan[] = [
        {
            id: 1,
            title: "Mediterranean Diet Plan",
            category: "Weight Loss",
            description: "7-day meal plan focused on healthy fats and lean proteins",
            calories: "1,500 cal/day",
            clientsCount: 23,
        },
        {
            id: 2,
            title: "Low Glycemic Index Plan",
            category: "Diabetes",
            description: "Balanced meals for blood sugar management",
            calories: "1,800 cal/day",
            clientsCount: 15,
            favorite: true,
        },
        {
            id: 3,
            title: "High Performance Plan",
            category: "Sports Nutrition",
            description: "Optimized nutrition for athletic performance",
            calories: "2,500 cal/day",
            clientsCount: 8,
        },
    ];

    return (
        <div className="card meal-plans-card">
            <div className="card-header">
                <h3><i className="fas fa-book"></i> Meal Plan Library</h3>
                <div className="library-controls">
                    <div className="search-box1">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search meal plans..." />
                    </div>
                    <button className="btn btn-primary1 btn-sm">
                        <i className="fas fa-plus"></i>
                        Create New
                    </button>
                </div>
            </div>

            <div className="card-content meal-plan-grid">
                {mealPlans.map((plan) => (
                    <MealPlanCard key={plan.id} plan={plan} />
                ))}
            </div>
        </div>
    );
}
