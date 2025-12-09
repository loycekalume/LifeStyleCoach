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
import { useEffect, useState } from "react";
import { getClientById } from "../Services/clientViewService";
import BookSessionModal from "../components/client/bookSessionModal";
import LogMealModal from "../components/client/logMealModal";
import { createMealLog } from "../Services/mealLogService";

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [userName, setUserName] = useState("User"); // Default name state
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress"
  >("dashboard");

  // FIX: Try to get the real User ID from login, fallback to 13 if missing
  const userId = Number(localStorage.getItem("userId") || 13);

  useEffect(() => {
    // 1. Set the Name immediately from storage
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }

    // 2. Load Client Data from Backend
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
    const { meal_time, description, calories } = meal;
    try {
      await createMealLog({
        user_id: client.user_id, meal_time, description, calories,
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
        onNavigate={(page) => setCurrentPage(page)} />

      {currentPage === "dashboard" && (
        <>
          <section className="welcome-section">
            <div className="welcome-content">
              {/* DYNAMIC NAME HERE */}
              <h1>Welcome back, {userName}! 👋</h1>
              <p>Ready to crush your fitness and health goals today?</p>
            </div>
            <div className="quick-actions">
              <button className="action-btn primary">
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
          <h1>Workouts</h1>
          <p>Select a workout plan or start a session.</p>
        </section>
      )}

      {currentPage === "nutrition" && (
        <section className="main-section">
          <h1>Nutrition</h1>
          <NutritionCard client={client} />
        </section>
      )}

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