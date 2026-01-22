import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Client.css";

// Components
import TopNav from "../components/client/TopNav";
import MobileNav from "../components/client/MobileNav";
import SessionsCard from "../components/client/SessionCard";
import ProgressChart from "../components/client/progressChart";
import WorkoutPlan from "../components/client/WorkoutPlan";
import NutritionCard from "../components/client/NutritionCard";
import ActivityCard from "../components/client/recommendedMeals";
import GoalsCard from "../components/client/GoalsCard";
import InstructorsList from "../components/client/instructorList";
import BookSessionModal from "../components/client/bookSessionModal";
import LogMealModal from "../components/client/logMealModal";
import ClientWorkouts from "../components/client/myWorkouts";
import ClientMealPlans from "../components/client/clientMealPlans";

// Services & Types
import type { Client } from "../Services/clientViewService";
import { getClientById } from "../Services/clientViewService";
import { createMealLog } from "../Services/mealLogService";

// Define valid page types to avoid Type errors
type PageType = "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();
  // Initialize state from LocalStorage so it remembers where you were on refresh
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const savedPage = localStorage.getItem("clientCurrentPage");
    // Validate that the saved page is a valid PageType, otherwise default to dashboard
    return (savedPage as PageType) || "dashboard";
  });

  const [nutritionView, setNutritionView] = useState<"overview" | "plans">("overview");

  const userId = Number(localStorage.getItem("userId") || 13);

  // Save to LocalStorage whenever currentPage changes
  useEffect(() => {
    localStorage.setItem("clientCurrentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    async function loadClient() {
      try {
        const data = await getClientById(userId);
        setClient(data);
      } catch (err) {
        console.error("Error loading client:", err);
      }
    }
    loadClient();
  }, [userId]);

  const handleLogMeal = async (meal: { meal_time: string; description: string; calories: number }) => {
    if (!client) return;
    try {
      await createMealLog({
        user_id: client.user_id,
        meal_time: meal.meal_time,
        description: meal.description,
        calories: meal.calories,
        log_id: 0
      });
      alert("Meal logged successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to log meal");
    }
  };

  // Helper function to handle navigation changes and reset sub-views
  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setNutritionView("overview");
  };

  // Main content renderer based on current page state
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <section className="welcome-section">
              <div className="welcome-content">
                <h1>Welcome back, {userName}! 👋</h1>
                <p>Ready to crush your fitness and health goals today?</p>
              </div>
              <div className="quick-actions">
                <button className="action-btn primary" onClick={() => handleNavigation("workouts")}>
                  <i className="fas fa-play"></i> Start Workout
                </button>

                <button className="action-btn secondary" onClick={() => setModalOpen(true)}>
                  <i className="fas fa-calendar-plus"></i> Book Session
                </button>
                <BookSessionModal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onNavigate={(page) => handleNavigation(page as PageType)}
                />

                <button
                  className="action-btn tertiary"
                  onClick={() => navigate("/messages")} // Navigates to the main chat inbox
                >
                  <i className="fas fa-comments"></i> My Chats
                </button>
                <LogMealModal
                  open={mealLogOpen}
                  onClose={() => setMealLogOpen(false)}
                  onSubmit={handleLogMeal}
                />
              </div>
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-left">
                <SessionsCard client={client} />
                <WorkoutPlan client={client} />
              </div>
              <div className="dashboard-middle">
                <ProgressChart client={client} />
                <NutritionCard client={client} />
              </div>
              <div className="dashboard-right">
                <ActivityCard client={client} />
                <GoalsCard client={client} />
              </div>
            </div>
          </>
        );

      case "workouts":
        return (
          <section className="main-section">
            <ClientWorkouts />
          </section>
        );

      case "nutrition":
        return (
          <section className="main-section">
            {nutritionView === "overview" ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h1>Nutrition Overview</h1>
                  <button
                    className="action-btn primary"
                    onClick={() => setNutritionView("plans")}
                    style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                  >
                    <i className="fas fa-utensils" style={{ marginRight: '8px' }}></i>
                    My Meal Plans
                  </button>
                </div>
                <NutritionCard client={client} />
              </>
            ) : (
              <>
                <button
                  onClick={() => setNutritionView("overview")}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <i className="fas fa-arrow-left"></i> Back to Overview
                </button>
                <ClientMealPlans />
              </>
            )}
          </section>
        );

      case "instructors":
        return (
          <section className="main-section">
            <h1>Available Instructors</h1>
            <InstructorsList />
          </section>
        );

      case "schedule":
        return (
          <section className="main-section">
            <h1>Schedule</h1>
            <p>Your upcoming sessions will appear here.</p>
          </section>
        );

      case "progress":
        return (
          <section className="main-section">
            <h1>Progress</h1>
            <ProgressChart client={client} />
          </section>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <>
      <TopNav
        currentPage={currentPage}
        onNavigate={(page) => handleNavigation(page as PageType)}
      />

      {/* Render the active page content */}
      {renderContent()}

      <MobileNav />
    </>
  );
}