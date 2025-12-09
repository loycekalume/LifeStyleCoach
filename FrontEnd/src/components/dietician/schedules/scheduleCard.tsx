
import ScheduleItem  from "./scheduleItem";
import type{ Schedule } from "./scheduleItem"
export default function ScheduleCard() {
  const schedules: Schedule[] = [
    {
      id: 1,
      time: "9:00 AM",
      duration: "45 min",
      clientName: "Emma Johnson",
      clientImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      consultationType: "Initial Consultation",
      notes: "Weight loss goals, vegetarian diet",
      current: true,
    },
    {
      id: 2,
      time: "10:30 AM",
      duration: "30 min",
      clientName: "Michael Chen",
      clientImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      consultationType: "Follow-up Session",
      notes: "Diabetes management, meal plan review",
    },
    {
      id: 3,
      time: "2:00 PM",
      duration: "45 min",
      clientName: "Lisa Rodriguez",
      clientImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      consultationType: "Nutrition Assessment",
      notes: "Sports nutrition, performance optimization",
    },
  ];

  return (
    <div className="card schedule-card">
      <div className="card-header">
        <h3><i className="fas fa-calendar-day"></i> Today's Schedule</h3>
        <span className="date">March 15, 2024</span>
      </div>
      <div className="card-content">
        <div className="schedule-list">
          {schedules.map((item) => (
            <ScheduleItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
