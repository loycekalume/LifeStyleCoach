import { useState, useEffect } from "react";
import { FaCalendarCheck, FaExclamationCircle, FaSpinner } from "react-icons/fa"; 
import axiosInstance from "../../../utils/axiosInstance";
import ScheduleItem from "./scheduleItem"; 
import type { Schedule } from "./scheduleItem";
import "../../../styles/scheduleCard.css"; 



const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const getTodayISO = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDisplayDate = () => {
  return new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function ScheduleCard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // ... [Keep your existing fetch logic exactly as it is] ...
    const fetchSchedules = async () => {
      try {
        const today = getTodayISO();
        const response = await axiosInstance.get(`/consultations?date=${today}`);
        setDebugInfo(response.data.debug);

        const rawData = response.data.consultations || [];
        const formattedData: Schedule[] = rawData.map((item: any) => ({
          id: item.id,
          time: formatTime(item.scheduled_time),
          duration: "60 min", 
          clientName: item.client_name || "Unknown Client",
          clientImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.client_name || 'User')}&background=random&size=40`,
          consultationType: item.category,
          notes: item.notes || "No notes provided",
          current: isCurrentMeeting(item.scheduled_time) 
        }));

        setSchedules(formattedData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const isCurrentMeeting = (timeString: string) => {
    if (!timeString) return false;
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const meetingTime = new Date();
    meetingTime.setHours(hours, minutes, 0);
    const diffInMinutes = (now.getTime() - meetingTime.getTime()) / 1000 / 60;
    return diffInMinutes >= 0 && diffInMinutes < 60; 
  };

  return (
    <div className="schedule-card">
      <div className="card-header">
        <h3><FaCalendarCheck /> Today's Schedule</h3>
        <span className="date">{getDisplayDate()}</span>
      </div>
      
      <div className="card-content">
        {/* Debug info (Hidden if no debug info) */}
        {debugInfo && (
          <div className="debug-box">
             <span><strong>Total in DB:</strong> {debugInfo.total_in_db}</span>
             <span><strong>Today:</strong> {debugInfo.filtered_count}</span>
          </div>
        )}

        {loading ? (
           <div className="state-container">
             <FaSpinner className="empty-state-icon fa-spin" />
             <div className="empty-text">Syncing schedule...</div>
           </div>
        ) : error ? (
           <div className="state-container">
             <div className="error-message">
               <FaExclamationCircle style={{marginRight: '8px'}}/> {error}
             </div>
           </div>
        ) : schedules.length === 0 ? (
           <div className="state-container">
             <div className="empty-state-icon">☕</div>
             <div className="empty-text">No appointments today</div>
             <div className="empty-subtext">Enjoy your free time!</div>
             
             {debugInfo && debugInfo.total_in_db > 0 && (
               <div style={{ marginTop: '15px', fontSize: '0.75rem', color: '#cbd5e0' }}>
                 You have {debugInfo.total_in_db} upcoming appointment{debugInfo.total_in_db !== 1 ? 's' : ''} later this week.
               </div>
             )}
           </div>
        ) : (
          <div className="schedule-list">
            {schedules.map((item) => (
              <ScheduleItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}