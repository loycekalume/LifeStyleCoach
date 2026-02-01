import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance"; 

// Components
import MealPlanLibrary from "../components/dietician/mealPlans/mealPlanLibrary";
import ScheduleCard from "../components/dietician/schedules/scheduleCard";
import RecentActivity from "../components/dietician/recentActivity";
import ConsultationModal from "../components/dietician/schedules/scheduleModal";
import type { ActivityItem } from "../components/dietician/recentActivity";
import Header from "../components/dietician/header/header";
import RecentClients from "../components/dietician/clients/recentClients"; 
import { ModalProvider } from './../contexts/modalContext';

// Styles
import "../styles/dieticianDashboard.css";

const activities: ActivityItem[] = [
    {
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        client: "Emma Johnson",
        action: "Logged breakfast - Oatmeal with berries",
        time: "5 minutes ago",
        statusLabel: "calories",
        statusType: "good",
    },
    // ... add more if needed
];

// ✅ Interface for the Stats
interface DashboardStats {
    total_clients: number;
    meal_plans_created: number;
    today_consultations: number;
}

const DieticianDashboard: React.FC = () => {
    const [dieticianName, setDieticianName] = useState<string>("Dietician");
    
    // ✅ NEW: State for real stats
    const [stats, setStats] = useState<DashboardStats>({
        total_clients: 0,
        meal_plans_created: 0,
        today_consultations: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem("userId");

                // 1. Fetch Profile Name (Existing logic)
                if (userId) {
                    const profileRes = await axios.get(`http://localhost:3000/users/${userId}`);
                    if (profileRes.data && profileRes.data.name) {
                        setDieticianName(profileRes.data.name);
                    }
                }

                // 2. ✅ Fetch Real Stats (New logic)
                // We use axiosInstance to ensure the token/cookies are sent
                const statsRes = await axiosInstance.get('/dietician/stats');
                setStats(statsRes.data);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 16) return "Good afternoon";
        return "Good evening"; 
    };

    const handleConsultationAdded = () => {
        console.log('New consultation added - you might want to re-fetch stats here');
        // Optional: refetch stats here to update the count immediately
    };

    return (
        <ModalProvider> 
            <div>
                <Header />
                <ConsultationModal onConsultationAdded={handleConsultationAdded} />
                
                <section className="welcome-section">
                    <div className="welcome-content">
                        <h2>
                            {loading ? "Loading..." : `${getGreeting()}, Dr. ${dieticianName}! 🥗`}
                        </h2>
                        {/* ✅ Dynamic Text based on real data */}
                        <p>
                            You have <strong>{stats.today_consultations} consultations</strong> scheduled today.
                        </p>
                    </div>
                    
                    <div className="quick-stats">
                        {/* ✅ Active Clients Card */}
                        <div className="stat-card">
                            <div className="stat-icon clients"><i className="fas fa-users"></i></div>
                            <div className="stat-info">
                                <div className="stat-number">{stats.total_clients}</div>
                                <div className="stat-label">Active Clients</div>
                            </div>
                        </div>
                        
                        {/* ✅ Meal Plans Card */}
                        <div className="stat-card">
                            <div className="stat-icon plans"><i className="fas fa-clipboard-list"></i></div>
                            <div className="stat-info">
                                <div className="stat-number">{stats.meal_plans_created}</div>
                                <div className="stat-label">Meal Plans</div>
                            </div>
                        </div>
                        
                        {/* ✅ Today's Sessions Card */}
                        <div className="stat-card">
                            <div className="stat-icon consultations"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-info">
                                <div className="stat-number">{stats.today_consultations}</div>
                                <div className="stat-label">Today's Sessions</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="dashboard-grid">
                    <div className="dashboard-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* ✅ Added RecentClients Component */}
                        <RecentClients />
                        <ScheduleCard />
                    </div>

                    <div className="dashboard-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <MealPlanLibrary />
                         <RecentActivity activities={activities} />
                    </div>
                </div>
            </div>
        </ModalProvider> 
    );
};

export default DieticianDashboard;