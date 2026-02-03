import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/clientWorkouts.css";

// Interface matches your database exactly
interface PlanItem {
  exercise: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  rest?: number; // seconds
}

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  video_url?: string;
  plan: PlanItem[];
  instructor_name: string;
  status: string;
  last_performed?: string; 
  workout_id: number;      
  total_duration?: number; // ✅ Added this field
}

const ClientWorkouts: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Assignment | null>(null);
  
  // Timer State (For Gamification/Locking)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [requiredSeconds, setRequiredSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logData, setLogData] = useState({ duration: "", notes: "", rating: 3 });

  // 1. Fetch Assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
      try {
        
        const res = await axiosInstance.get("/workoutLogs/my-assignments");
        setAssignments(res.data);
      } catch (err) {
        console.error("Error loading workouts", err);
      }
  };

  // 2. Smart Timer Logic (Based on Total Duration)
  useEffect(() => {
    if (selectedWorkout && !isLogModalOpen) {
      
      // ✅ LOGIC UPDATE: Use the Instructor's set duration
      // If total_duration is null/0, default to 30 mins (1800 seconds)
      const durationMins = selectedWorkout.total_duration || 30;
      const totalSeconds = durationMins * 60;
      
      const limit = Math.floor(totalSeconds * 0.75); // 🔒 Lock until 75% done
      
      setRequiredSeconds(limit);
      setElapsedSeconds(0);
      setIsLocked(true);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          if (prev + 1 >= limit) setIsLocked(false); // 🔓 Unlock!
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selectedWorkout, isLogModalOpen]);

  const handleOpenLog = () => setIsLogModalOpen(true);

  // 3. Submit Log
  const submitLog = async () => {
    if (!selectedWorkout) return;
    try {
      // ✅ Corrected Route: /clientWorkouts/log-session
      await axiosInstance.post("/workoutLogs/log-session", {
        assignment_id: selectedWorkout.assignment_id,
        workout_id: selectedWorkout.workout_id,
        // Auto-fill duration from timer if user doesn't type one
        duration: logData.duration || Math.ceil(elapsedSeconds / 60), 
        notes: logData.notes,
        rating: logData.rating
      });
      
      alert("Great job! Session logged. 🔥");
      setIsLogModalOpen(false);
      setSelectedWorkout(null);
      setLogData({ duration: "", notes: "", rating: 3 }); // Reset form
      fetchAssignments(); // Refresh list to update "Last Performed" date
    } catch (error) {
      console.error("Log failed", error);
      alert("Failed to save log.");
    }
  };

  // YouTube Embed Helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="client-workout-container">
      <h1 className="page-title">My Assignments</h1>
      <div className="workouts-grid">
        {assignments.map(assign => (
           <div key={assign.assignment_id} className="workout-card">
              <div className="card-top">
                 <h3>{assign.title}</h3>
                 
                 {/* ✅ REMOVED Instructor Name, ADDED Duration Badge */}
                 <span className="duration-badge" style={{
                     background: '#e0f2fe', color: '#0284c7', 
                     padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                 }}>
                    ⏱ {assign.total_duration || 30} Mins
                 </span>
              </div>
              
              {/* Last Performed Badge */}
              {assign.last_performed ? (
                 <p className="last-done-text">
                    Last done: {new Date(assign.last_performed).toLocaleDateString()}
                 </p>
              ) : (
                 <p className="last-done-text new">New Assignment! 🌟</p>
              )}

              <button className="btn-start" onClick={() => setSelectedWorkout(assign)}>
                  Start Routine ▶
              </button>
           </div>
        ))}
        {assignments.length === 0 && <p>No workouts assigned yet.</p>}
      </div>

      {/* WORKOUT PLAYER MODAL */}
      {selectedWorkout && !isLogModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content workout-modal">
            <div className="modal-header">
               <h2>{selectedWorkout.title}</h2>
               <div className="timer-badge">
                 ⏱ {formatTime(elapsedSeconds)} / {formatTime(requiredSeconds)}
               </div>
            </div>

            <div className="modal-body-scroll">
               {/* Progress Bar */}
               <div className="progress-container">
                  <div 
                    className="progress-fill" 
                    style={{width: `${Math.min((elapsedSeconds / requiredSeconds) * 100, 100)}%`}}
                  ></div>
               </div>
               
               <p className="lock-status">
                  {isLocked 
                    ? "Keep going! Button unlocks when you reach the target time." 
                    : "Target reached! You can now finish."}
               </p>

               {/* Video */}
               {selectedWorkout.video_url && (
                 <div className="video-container">
                   <iframe
                     width="100%" height="315"
                     src={getEmbedUrl(selectedWorkout.video_url)!}
                     title="Video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen
                   ></iframe>
                 </div>
               )}

               {/* Plan Table */}
               <table className="routine-table">
                 <thead>
                    <tr><th>Exercise</th><th>Sets</th><th>Target</th><th>Rest</th></tr>
                 </thead>
                 <tbody>
                    {selectedWorkout.plan.map((item, i) => (
                        <tr key={i}>
                            <td>{item.exercise}</td>
                            <td>{item.sets}</td>
                            <td>{item.reps ? `${item.reps} reps` : `${item.duration}s`}</td>
                            <td>{item.rest ? `${item.rest}s` : '-'}</td>
                        </tr>
                    ))}
                 </tbody>
               </table>
            </div>

            <div className="modal-footer">
               <button className="btn-cancel" onClick={() => setSelectedWorkout(null)}>Exit</button>
               
               {/* 🔒 THE LOCKED BUTTON */}
               <button 
                 className={`btn-complete ${isLocked ? 'locked' : ''}`} 
                 onClick={handleOpenLog}
                 disabled={isLocked}
               >
                 {isLocked ? `🔒 Locked` : "✅ I Finished!"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG MODAL */}
      {isLogModalOpen && (
          <div className="modal-overlay" style={{zIndex: 1100}}>
             <div className="modal-content small-modal">
                <h3>Session Complete!</h3>
                
                <div className="form-group">
                    <label>Duration (Minutes)</label>
                    <input 
                        type="number" 
                        value={logData.duration} 
                        onChange={(e) => setLogData({...logData, duration: e.target.value})}
                        // Placeholder suggests estimated time
                        placeholder={Math.ceil(elapsedSeconds / 60).toString()}
                    />
                </div>

                <div className="form-group">
                    <label>How hard was it? (1-5)</label>
                    <div className="rating-row">
                        {[1,2,3,4,5].map(num => (
                            <button 
                                key={num}
                                className={`rate-btn ${logData.rating === num ? 'active' : ''}`}
                                onClick={() => setLogData({...logData, rating: num})}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea 
                        value={logData.notes}
                        onChange={(e) => setLogData({...logData, notes: e.target.value})}
                        placeholder="Any pain? Felt strong?"
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={() => setIsLogModalOpen(false)} className="btn-cancel">Cancel</button>
                    <button onClick={submitLog} className="btn-save">Save Log</button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default ClientWorkouts;