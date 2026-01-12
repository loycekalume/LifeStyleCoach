import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClock, FaPlayCircle, FaLock } from "react-icons/fa";

interface ActiveSessionProps {
  workoutId: number;
  workoutName: string;
  exercises: any[]; 
  userId: number;
  onClose: () => void;
  estimatedDuration: number;
}

export default function ActiveWorkoutModal({ 
  workoutId, 
  workoutName, 
  exercises, 
  userId, 
  onClose,
  estimatedDuration // e.g. 30 (minutes)
}: ActiveSessionProps) {
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseInputs, setExerciseInputs] = useState<Record<number, string>>({});
  const [openVideoIndex, setOpenVideoIndex] = useState<number | null>(null);

  // 1. CALCULATE THE "LOCKDOWN" THRESHOLD
  // The user must spend at least 70% of the estimated time.
  // Example: 30 mins * 60 * 0.7 = 1260 seconds (21 mins)
  const minRequiredSeconds = (estimatedDuration * 60) * 0.7;
  const isTooEarly = seconds < minRequiredSeconds;
  const secondsRemainingToUnlock = minRequiredSeconds - seconds;

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) return "00:00";
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    setExerciseInputs(prev => ({ ...prev, [index]: value }));
  };

  const toggleVideo = (index: number) => {
    setOpenVideoIndex(prev => (prev === index ? null : index));
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    const videoId = url.split("v=")[1];
    if (videoId) {
        const cleanId = videoId.split("&")[0];
        return `https://www.youtube.com/embed/${cleanId}`;
    }
    return url; 
  };

  const handleFinish = async () => {
    // 🛑 LOGIC CHECK: Are they trying to hack the disabled button?
    if (isTooEarly) {
        alert("You cannot submit yet! Keep working.");
        return;
    }

    const filledCount = Object.keys(exerciseInputs).length;
    if (filledCount < exercises.length) {
        alert(`Please log reps for all exercises.`);
        return;
    }

    setIsSubmitting(true);
    setIsActive(false);

    try {
      const durationMinutes = Math.ceil(seconds / 60);
      await axios.post("http://localhost:3000/workoutLogs/complete", {
        user_id: userId,
        template_id: workoutId,
        duration_minutes: durationMinutes,
        notes: "Verified Duration Workout",
        logged_details: exerciseInputs 
      });

      alert("Workout Verified & Saved! 💪");
      onClose();
    } catch (error) {
      console.error("Failed to save log", error);
      alert("Error saving workout.");
      setIsActive(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (Object.keys(exerciseInputs).length / exercises.length) * 100;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{workoutName}</h3>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Target: {estimatedDuration} mins</span>
          </div>
          <div style={timerBoxStyle}>
            <FaClock style={{ marginRight: '8px' }} />
            {formatTime(seconds)}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '6px', background: '#eee', width: '100%' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#28a745', transition: 'width 0.3s' }}></div>
        </div>

        {/* List of Exercises */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {exercises.map((ex, idx) => {
            const isFilled = !!exerciseInputs[idx];
            const isVideoOpen = openVideoIndex === idx;

            return (
              <div key={idx} style={{ 
                  ...exerciseContainerStyle, 
                  borderLeft: isFilled ? '5px solid #28a745' : '5px solid #ddd' 
              }}>
                <div style={exerciseRowStyle}>
                    <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem', color: '#333' }}>{ex.name}</strong>
                        <div style={{ color: '#666', fontSize: '0.85rem' }}>
                            {ex.sets} Sets x {ex.reps}
                        </div>
                        
                        {ex.video_url && (
                            <button onClick={() => toggleVideo(idx)} style={videoToggleBtnStyle}>
                                <FaPlayCircle /> {isVideoOpen ? "Hide Demo" : "Watch Demo"}
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input 
                            type="number" 
                            placeholder="0"
                            style={inputStyle}
                            value={exerciseInputs[idx] || ""}
                            onChange={(e) => handleInputChange(idx, e.target.value)}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Reps</span>
                    </div>
                </div>

                {isVideoOpen && ex.video_url && (
                    <div style={videoContainerStyle}>
                         <iframe 
                            width="100%" 
                            height="200" 
                            src={getEmbedUrl(ex.video_url)} 
                            title={ex.name}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={footerStyle}>
          <button onClick={onClose} style={cancelButtonStyle} disabled={isSubmitting}>Give Up</button>
          
          {/* 👇 THE LOCKED BUTTON LOGIC */}
          <button 
            onClick={handleFinish} 
            style={{ 
              ...finishButtonStyle, 
              // Visual feedback: Grey if locked, Green if active
              backgroundColor: isTooEarly ? '#ccc' : '#28a745',
              cursor: isTooEarly ? 'not-allowed' : 'pointer'
            }}
            // Disable if too early OR currently submitting
            disabled={isTooEarly || isSubmitting}
          >
            {isSubmitting ? "Saving..." : (
               isTooEarly 
               ? <span><FaLock style={{fontSize:'0.8rem'}}/> Unlock in {formatTime(secondsRemainingToUnlock)}</span> 
               : "Finish Workout"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle: React.CSSProperties = { width: '90%', maxWidth: '500px', height: '80vh', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle: React.CSSProperties = { padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const timerBoxStyle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff', display: 'flex', alignItems: 'center', backgroundColor: '#e3f2fd', padding: '5px 15px', borderRadius: '8px' };
const exerciseContainerStyle: React.CSSProperties = { marginBottom: '10px', backgroundColor:'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' };
const exerciseRowStyle: React.CSSProperties = { padding: '15px', display: 'flex', alignItems: 'center' };
const inputStyle: React.CSSProperties = { width: '60px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' };
const footerStyle: React.CSSProperties = { padding: '20px', backgroundColor: 'white', borderTop: '1px solid #ddd', display: 'flex', gap: '15px' };
const cancelButtonStyle: React.CSSProperties = { flex: 1, padding: '15px', border: 'none', background: '#e0e0e0', color: '#333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const videoToggleBtnStyle: React.CSSProperties = { marginTop: '8px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 };
const videoContainerStyle: React.CSSProperties = { background: '#000', padding: '10px' };

// Updated Finish Button Style
const finishButtonStyle: React.CSSProperties = { 
  flex: 2, 
  padding: '15px', 
  border: 'none', 
  color: 'white', 
  borderRadius: '8px', 
  fontWeight: 'bold', 
  fontSize: '1rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 0.3s'
};