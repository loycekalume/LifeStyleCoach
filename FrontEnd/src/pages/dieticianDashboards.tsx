import React from "react";
import MealPlanLibrary from "../components/dietician/mealPlans/mealPlanLibrary";
import ScheduleCard from "../components/dietician/schedules/scheduleCard";
import RecentActivity from "../components/dietician/recentActivity";
import ConsultationModal from "../components/dietician/schedules/scheduleModal";
import type { ActivityItem } from "../components/dietician/recentActivity";
import "../styles/dieticianDashboard.css";
import Header from "../components/dietician/header/header";
import { ModalProvider } from './../contexts/modalContext';

const activities: ActivityItem[] = [
    {
        avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        client: "Emma Johnson",
        action: "Logged breakfast - Oatmeal with berries",
        time: "5 minutes ago",
        statusLabel: "calories",
        statusType: "good",
    },
    {
        avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        client: "Michael Chen",
        action: "Completed daily water intake goal",
        time: "15 minutes ago",
        statusLabel: "water-intake",
        statusType: "excellent",
    },
    {
        avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        client: "Lisa Rodriguez",
        action: "Requested meal plan modification",
        time: "1 hour ago",
        statusLabel: "request-type",
        statusType: "pending",
    },
];

const DieticianDashboard: React.FC = () => {
    // Optional: Function to refresh consultation data when a new one is added
    const handleConsultationAdded = () => {
        console.log('New consultation added - refresh data if needed');
        // You can add logic here to refresh the ScheduleCard component
    };

    return (
        <ModalProvider> 
            <div>
                <Header />
                
                {/* Consultation Modal - Always mounted and controlled by context */}
                <ConsultationModal onConsultationAdded={handleConsultationAdded} />
                
                <section className="welcome-section">
                    <div className="welcome-content">
                        <h2>Good morning, Dr. Wilson! 🥗</h2>
                        <p>You have 8 consultations scheduled today and 3 meal plans pending review.</p>
                    </div>
                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-card">
                            <div className="stat-icon clients">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-number">127</div>
                                <div className="stat-label">Active Clients</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon plans">
                                <i className="fas fa-clipboard-list"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-number">89</div>
                                <div className="stat-label">Meal Plans</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon consultations">
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-number">8</div>
                                <div className="stat-label">Today's Sessions</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="dashboard-grid">
                    <MealPlanLibrary />
                    <ScheduleCard />
                    <RecentActivity activities={activities} />
                </div>
            </div>
        </ModalProvider> 
    );
};

export default DieticianDashboard;