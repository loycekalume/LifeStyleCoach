import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Client.css";
import axiosInstance from "../utils/axiosInstance";
import io from "socket.io-client"; // ✅ Import Socket

// Components
import TopNav from "../components/client/TopNav";
import MobileNav from "../components/client/MobileNav";
import SessionsCard from "../components/client/SessionCard";
import ProgressChart from "../components/client/progressChart";
import WorkoutPlan from "../components/client/WorkoutPlan";
import NutritionCard from "../components/client/NutritionCard";
import AssignedMealPlans from "../components/client/recommendedMealPlans"; 
import GoalsCard from "../components/client/GoalsCard";
import InstructorsList from "../components/client/instructorList";
import BookSessionModal from "../components/client/bookSessionModal";
import LogMealModal from "../components/client/logMealModal";
import ClientWorkouts from "../components/client/myWorkouts";
import MatchedDieticians from "../components/client/clientDieticians";
import ClientMealPlans from "../components/client/clientMealPlans"; 
import MealPlanDetails from "../components/client/mealPlanDetails";

import type { Client } from "../Services/clientViewService";
import { getClientById } from "../Services/clientViewService";
import ConsistencyCard from "../components/client/consistencyCard";

type PageType = "dashboard" | "workouts" | "nutrition" | "instructors" | "schedule" | "progress";

// Ensure this matches your backend URL
const SOCKET_URL = "http://localhost:3000"; 

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  
  // ✅ NEW: Unread Count State
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // State for Navigation
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const savedPage = localStorage.getItem("clientCurrentPage");
    return (savedPage as PageType) || "dashboard";
  });

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const navigate = useNavigate();
  const userId = Number(localStorage.getItem("userId") || 13);

  // Persistence
  useEffect(() => {
    localStorage.setItem("clientCurrentPage", currentPage);
  }, [currentPage]);

  // ✅ NEW: Socket & Notification Logic
  useEffect(() => {
    // 1. Initial Fetch
    fetchUnreadCount();

    // 2. Socket Connection
    if (userId) {
        const socket = io(SOCKET_URL);
        
        // Join personal notification room
        socket.emit("join_user_room", userId);

        // Listen for real-time alerts
        socket.on("new_message_notification", () => {
             setUnreadCount(prev => prev + 1);
        });

        return () => { socket.disconnect(); };
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get("/messages/conversations");
      const totalUnread = res.data.reduce((sum: number, conv: any) => {
          return sum + Number(conv.unread_count || 0);
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread count", error);
    }
  };

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
    setSelectedPlanId(null); 
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
          
          {/* ✅ UPDATED: My Chats Button with Badge */}
          <button 
            className="action-btn tertiary" 
            onClick={() => navigate("/messages")}
            style={{ position: 'relative' }} 
          >
            <i className="fas fa-comment-dots"></i> My Chats
            
            {/* 🔴 RED BADGE */}
            {unreadCount > 0 && (
                <span className="notification-badge" style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
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
          <ConsistencyCard clientId={client.user_id} />
            <NutritionCard client={client} /> 
          </div>
          <div className="dashboard-right">
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
    if (selectedPlanId) {
      return (
        <section className="main-section">
          <MealPlanDetails 
            planId={selectedPlanId} 
            onBack={() => setSelectedPlanId(null)} 
          />
        </section>
      );
    }

    return (
      <section className="main-section">
        <h1>Nutrition Overview</h1>
        {client && <NutritionCard client={client} />}
        <ClientMealPlans onPlanSelect={(id) => setSelectedPlanId(id)} />
      </section>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard": return renderDashboard();
      case "workouts": return <section className="main-section"><ClientWorkouts /></section>;
      case "nutrition": return renderNutrition(); 
      case "instructors": return <section className="main-section"><h1>Instructors</h1><InstructorsList /></section>;
      case "schedule": return <section className="main-section"><MatchedDieticians /></section>;
      case "progress": return <section className="main-section">{client && <ProgressChart client={client} />}</section>;
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