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
// This is the daily menu card for the dashboard right column
import AssignedMealPlans from "../components/client/asignedMealPlans"; 
import GoalsCard from "../components/client/GoalsCard";
import InstructorsList from "../components/client/instructorList";
import BookSessionModal from "../components/client/bookSessionModal";
import LogMealModal from "../components/client/logMealModal";
import ClientWorkouts from "../components/client/myWorkouts";
import MatchedDieticians from "../components/client/clientDieticians";

// These act as the sub-views for the Nutrition tab
import ClientMealPlans from "../components/client/clientMealPlans"; 
import MealPlanDetails from "../components/client/mealPlanDetails"; // The Detailed Timeline

import type { Client } from "../Services/clientViewService";
import { getClientById } from "../Services/clientViewService";

type PageType = "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  
  // State for Navigation
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const savedPage = localStorage.getItem("clientCurrentPage");
    return (savedPage as PageType) || "dashboard";
  });

  // ✅ NEW: State to track if a specific plan is selected in the Nutrition tab
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const navigate = useNavigate();
  const userId = Number(localStorage.getItem("userId") || 13);

  // Persistence
  useEffect(() => {
    localStorage.setItem("clientCurrentPage", currentPage);
  }, [currentPage]);

  // Data Loading
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

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setSelectedPlanId(null); // Reset detail view when changing tabs
  };

  // --- Content Renderers ---
  const renderDashboard = () => (
    <>
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Your daily health overview is ready.</p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => handleNavigation("workouts")}>
            <i className="fas fa-dumbbell"></i> Workout
          </button>
          <button className="action-btn secondary" onClick={() => setModalOpen(true)}>
            <i className="fas fa-calendar-check"></i> Book
          </button>
          <button className="action-btn tertiary" onClick={() => navigate("/messages")}>
            <i className="fas fa-comment-dots"></i> Chat
          </button>
        </div>
      </section>

      {client ? (
        <div className="dashboard-grid">
          <div className="dashboard-left">
            <SessionsCard client={client} />
            <WorkoutPlan client={client} />
          </div>
          <div className="dashboard-middle">
            <ProgressChart client={client} />
            {/* Summary Stats */}
            <NutritionCard client={client} /> 
          </div>
          <div className="dashboard-right">
            {/* Daily Menu Card */}
            <AssignedMealPlans client={client} />
            <GoalsCard client={client} />
          </div>
        </div>
      ) : (
        <div className="loading-container">Loading dashboard...</div>
      )}

      {/* Modals */}
      <BookSessionModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onNavigate={(page) => handleNavigation(page as PageType)} 
      />
      <LogMealModal 
        open={mealLogOpen} 
        onClose={() => setMealLogOpen(false)} 
        onSuccess={() => alert("Meal logged!")} 
      />
    </>
  );

  const renderNutrition = () => {
    // 1. DETAIL VIEW: If a plan ID is selected, show the Timeline
    if (selectedPlanId) {
      return (
        <section className="main-section">
          <MealPlanDetails 
            planId={selectedPlanId} 
            onBack={() => setSelectedPlanId(null)} // Back button resets state
          />
        </section>
      );
    }

    // 2. DEFAULT VIEW: Show Nutrition Card + List of All Plans
    return (
      <section className="main-section">
        <h1>Nutrition Overview</h1>
        
        {/* The Stats Card */}
        {client && <NutritionCard client={client} />}
        
        {/* The List of Plans - Clicking one sets the selectedPlanId */}
        <ClientMealPlans onPlanSelect={(id) => setSelectedPlanId(id)} />
        
      </section>
    );
  };

  // --- Main Switch ---
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard": return renderDashboard();
      case "workouts": return <section className="main-section"><ClientWorkouts /></section>;
      case "nutrition": return renderNutrition(); // ✅ Uses the logic above
      case "instructors": return <section className="main-section"><h1>Instructors</h1><InstructorsList /></section>;
      case "schedule": return <section className="main-section"><MatchedDieticians /></section>;
      case "progress": return <section className="main-section"><h1>Your Progress</h1>{client && <ProgressChart client={client} />}</section>;
      default: return <div>Page not found</div>;
    }
  };

  return (
    <>
      <TopNav currentPage={currentPage} onNavigate={(page) => handleNavigation(page as PageType)} />
      {renderContent()}
      <MobileNav />
    </>
  );
}