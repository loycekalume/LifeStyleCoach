import type { JSX } from "react/jsx-runtime";

export default function NutritionCard(): JSX.Element {
  return (
    <div className="card nutrition-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-utensils"></i> Nutrition Today
        </h3>
        <button className="btn-ghost">Add Meal</button>
      </div>

      <div className="card-content">
        <div className="nutrition-summary">

          <div className="calorie-ring">
            <div className="ring-chart">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="ring-center">
                <div className="calories-consumed">1,547</div>
                <div className="calories-goal">/ 2,100</div>
              </div>
            </div>
          </div>

          <div className="macro-breakdown">

            <div className="macro-item">
              <div className="macro-color carbs"></div>
              <div className="macro-info">
                <div className="macro-name">Carbs</div>
                <div className="macro-value">145g / 210g</div>
              </div>
            </div>

            <div className="macro-item">
              <div className="macro-color protein"></div>
              <div className="macro-info">
                <div className="macro-name">Protein</div>
                <div className="macro-value">89g / 120g</div>
              </div>
            </div>

            <div className="macro-item">
              <div className="macro-color fat"></div>
              <div className="macro-info">
                <div className="macro-name">Fat</div>
                <div className="macro-value">52g / 70g</div>
              </div>
            </div>

          </div>

        </div>

        <div className="recent-meals">

          <div className="meal-item">
            <div className="meal-time">Breakfast</div>
            <div className="meal-description">Oatmeal with berries</div>
            <div className="meal-calories">340 cal</div>
          </div>

          <div className="meal-item">
            <div className="meal-time">Lunch</div>
            <div className="meal-description">Grilled chicken salad</div>
            <div className="meal-calories">520 cal</div>
          </div>

          <div className="meal-item">
            <div className="meal-time">Snack</div>
            <div className="meal-description">Greek yogurt</div>
            <div className="meal-calories">150 cal</div>
          </div>

        </div>
      </div>
    </div>
  );
}
