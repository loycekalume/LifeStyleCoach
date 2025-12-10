import { useEffect, useState } from "react";
import SessionsCard from "../components/client/SessionCard";
import ProgressChart from "../components/client/progressChart";
import WorkoutPlan from "../components/client/WorkoutPlan"; 
import NutritionCard from "../components/client/NutritionCard";
import ActivityCard from "../components/client/ActivityCard";
import GoalsCard from "../components/client/GoalsCard";
import MobileNav from "../components/client/MobileNav";
import InstructorsList from "../components/instructor/instructorList";
import "../styles/Client.css";
import TopNav from "../components/client/TopNav";
import type { Client } from "../Services/clientViewService";
import { getClientById } from "../Services/clientViewService";
import BookSessionModal from "../components/client/bookSessionModal";
import LogMealModal from "../components/client/logMealModal";
import { createMealLog } from "../Services/mealLogService";

// Imports for the new pages
import ClientWorkouts from "../components/client/myWorkouts"; 
import ClientMealPlans from "../components/client/clientMealPlans"; 

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [userName, setUserName] = useState("User"); 
  
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress"
  >("dashboard");

  // 👇 NEW: State to toggle inside the Nutrition page
  const [nutritionView, setNutritionView] = useState<"overview" | "plans">("overview");

  const userId = Number(localStorage.getItem("userId") || 13);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    async function loadClient() {
      try {
        const data = await getClientById(userId);
        setClient(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadClient();
  }, [userId]);

  const handleLogMeal = async (meal: { meal_time: string; description: string; calories: number }) => {
    if (!client) return;
    try {
      await createMealLog({
        user_id: client.user_id, meal_time: meal.meal_time, description: meal.description, calories: meal.calories,
        log_id: 0
      });
      alert("Meal logged successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to log meal");
    }
  };

  return (
    <>
      <TopNav
        currentPage={currentPage}
        onNavigate={(page) => {
            setCurrentPage(page);
            setNutritionView("overview"); // Reset nutrition view when changing main tabs
        }} 
      />

      {currentPage === "dashboard" && (
        <>
          <section className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, {userName}! 👋</h1>
              <p>Ready to crush your fitness and health goals today?</p>
            </div>
            <div className="quick-actions">
              {/* Link to Workouts Page */}
              <button className="action-btn primary" onClick={() => setCurrentPage("workouts")}>
                <i className="fas fa-play"></i>
                Start Workout
              </button>
              
              <button className="action-btn secondary" onClick={() => setModalOpen(true)}>
                <i className="fas fa-calendar-plus"></i>
                Book Session
              </button>
              <BookSessionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onNavigate={(page) => setCurrentPage(page)}
              />

              <button className="action-btn tertiary" onClick={() => setMealLogOpen(true)}>
                <i className="fas fa-camera"></i>
                Log Meal
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
      )}

      {currentPage === "workouts" && (
        <section className="main-section">
           <ClientWorkouts />
        </section>
      )}

      {/* 👇 UPDATED NUTRITION SECTION */}
      {currentPage === "nutrition" && (
        <section className="main-section">
          {nutritionView === "overview" ? (
            // View 1: Card + Button
            <>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '20px'}}>
                  <h1>Nutrition Overview</h1>
                  <button 
                    className="action-btn primary" 
                    onClick={() => setNutritionView("plans")}
                    style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                  >
                    <i className="fas fa-utensils" style={{marginRight:'8px'}}></i>
                    My Meal Plans
                  </button>
              </div>
              <NutritionCard client={client} />
            </>
          ) : (
            // View 2: The Meal Plans List + Back Button
            <>
              <button 
                onClick={() => setNutritionView("overview")}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: '#666', marginBottom: '10px', display:'flex', alignItems:'center', gap:'5px'
                }}
              >
                <i className="fas fa-arrow-left"></i> Back to Overview
              </button>
              <ClientMealPlans />
            </>
          )}
        </section>
      )}
      {/* ----------------------------- */}

      {currentPage === "instructors" && (
        <section className="main-section">
          <h1>Available Instructors</h1>
          <InstructorsList />
        </section>
      )}

      {currentPage === "schedule" && (
        <section className="main-section">
          <h1>Schedule</h1>
          <p>Your upcoming sessions will appear here.</p>
        </section>
      )}

      {currentPage === "progress" && (
        <section className="main-section">
          <h1>Progress</h1>
          <ProgressChart client={client} />
        </section>
      )}

      <MobileNav />
    </>
  );
}