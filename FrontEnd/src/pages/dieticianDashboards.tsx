import React, { useState, useEffect } from "react";
import axios from "axios";
import MealPlanLibrary from "../components/dietician/mealPlans/mealPlanLibrary";
import ScheduleCard from "../components/dietician/schedules/scheduleCard";
import RecentActivity from "../components/dietician/recentActivity";
import ConsultationModal from "../components/dietician/schedules/scheduleModal";
import type { ActivityItem } from "../components/dietician/recentActivity";
import "../styles/dieticianDashboard.css";
import Header from "../components/dietician/header/header";
import { ModalProvider } from './../contexts/modalContext';

// 👇 1. Import the new component
import RecentClients from "../components/dietician/clients/recentClients"; 

const activities: ActivityItem[] = [
    // ... (your existing activity data)
    {
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        client: "Emma Johnson",
        action: "Logged breakfast - Oatmeal with berries",
        time: "5 minutes ago",
        statusLabel: "calories",
        statusType: "good",
    },
    // ... other activities
];

const DieticianDashboard: React.FC = () => {
    const [dieticianName, setDieticianName] = useState<string>("Dietician");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ... (your existing fetch profile logic)
        const fetchDieticianProfile = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`http://localhost:3000/users/${userId}`);
                if (response.data && response.data.name) {
                    setDieticianName(response.data.name);
                }
            } catch (error) {
                console.error("Error fetching dietician profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDieticianProfile();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 16) return "Good afternoon";
        return "Good evening"; 
    };

    const handleConsultationAdded = () => {
        console.log('New consultation added - refresh data if needed');
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
                        <p>You have 8 consultations scheduled today and 3 meal plans pending review.</p>
                    </div>
                    {/* ... (Your existing Quick Stats code) ... */}
                    <div className="quick-stats">
                        {/* ... stat cards ... */}
                         <div className="stat-card">
                            <div className="stat-icon clients"><i className="fas fa-users"></i></div>
                            <div className="stat-info"><div className="stat-number">127</div><div className="stat-label">Active Clients</div></div>
                        </div>
                         <div className="stat-card">
                            <div className="stat-icon plans"><i className="fas fa-clipboard-list"></i></div>
                            <div className="stat-info"><div className="stat-number">89</div><div className="stat-label">Meal Plans</div></div>
                        </div>
                         <div className="stat-card">
                            <div className="stat-icon consultations"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-info"><div className="stat-number">8</div><div className="stat-label">Today's Sessions</div></div>
                        </div>
                    </div>
                </section>

                <div className="dashboard-grid">
                    {/*  2. Add RecentClients here */}
                    <div className="dashboard-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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