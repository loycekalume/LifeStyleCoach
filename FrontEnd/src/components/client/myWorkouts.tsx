import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaRobot, 
  FaClock, 
  FaPlayCircle, 
  FaTimes, 
  FaSearch, 
  FaList, 
  FaHeart, 
  FaRegHeart,
  
} from "react-icons/fa";
import ActiveWorkoutModal from "./activeWorkoutModal"; 

// --- Types ---
interface SystemWorkout {
  template_id: number;
  name: string;
  description: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  estimated_duration_min: number;
  goal_category: string;
}

interface ExerciseDetail {
  name: string;
  target_muscle: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  video_url: string;
  equipment_needed: string;
}

export default function ClientSystemWorkouts() {
  // --- STATE MANAGEMENT ---
  
  // Data Lists
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<SystemWorkout[]>([]);
  const [libraryWorkouts, setLibraryWorkouts] = useState<SystemWorkout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SystemWorkout[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set()); // For quick "Is Liked?" checks

  // Navigation & Filters
  const [viewMode, setViewMode] = useState<"recommended" | "library" | "saved">("recommended");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  // Modal & Active Session State
  const [selectedWorkout, setSelectedWorkout] = useState<ExerciseDetail[] | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null); 
  const [activeTemplateName, setActiveTemplateName] = useState<string>("");
  const [activeDuration, setActiveDuration] = useState<number>(0); 
  const [isActiveMode, setIsActiveMode] = useState(false);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // User Context
  const userId = localStorage.getItem("userId") || "13";
  const API_BASE = "http://localhost:3000"; // Adjust if your port differs

  // --- EFFECTS ---

  // 1. Initial Load: Get Recommended & Saved IDs
  useEffect(() => {
    fetchRecommended();
    fetchSaved();
  }, [userId]);

  // 2. Fetch Library when needed
  useEffect(() => {
    if (viewMode === "library") {
        fetchLibrary();
    }
  }, [viewMode, filterDifficulty, searchTerm]);

  // --- API CALLS ---

  const fetchRecommended = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recommendedWorkouts/recommended/${userId}`);
      setRecommendedWorkouts(res.data.recommended_workouts);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrary = async () => {
    try {
        const params = new URLSearchParams();
        if(filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
        if(searchTerm) params.append('search', searchTerm);

        const res = await axios.get(`${API_BASE}/recommendedWorkouts/all?${params.toString()}`);
        setLibraryWorkouts(res.data);
    } catch (error) {
        console.error("Error fetching library:", error);
    }
  };

 const fetchSaved = async () => {
    try {
        const res = await axios.get(`${API_BASE}/recommendedWorkouts/saved/${userId}`);
        setSavedWorkouts(res.data);
        
        //  FIX: Add <number> here to force the type
        const ids = new Set<number>(res.data.map((w: SystemWorkout) => w.template_id));
        setSavedIds(ids);
    } catch (error) {
        console.error("Error fetching saved workouts:", error);
    }
  };

  const toggleSave = async (e: React.MouseEvent, workout: SystemWorkout) => {
    e.stopPropagation(); // Prevent opening the modal when clicking heart
    try {
        await axios.post(`${API_BASE}/recommendedWorkouts/save`, { 
            userId, 
            templateId: workout.template_id 
        });
        
        // Update Local State Optimistically
        const newSet = new Set(savedIds);
        if (newSet.has(workout.template_id)) {
            newSet.delete(workout.template_id);
            // Remove from saved list if currently viewing saved
            if(viewMode === 'saved') {
                setSavedWorkouts(prev => prev.filter(w => w.template_id !== workout.template_id));
            }
        } else {
            newSet.add(workout.template_id);
            // Add to saved list locally
            fetchSaved(); // Re-fetch to be safe/consistent
        }
        setSavedIds(newSet);
    } catch (error) {
        console.error("Error toggling save:", error);
        alert("Failed to update routine.");
    }
  };

  const handleViewDetails = async (templateId: number, templateName: string, duration: number) => {
    setDetailsLoading(true);
    setActiveTemplateName(templateName);
    setActiveTemplateId(templateId);
    setActiveDuration(duration); // 👈 Critical for Lockdown Logic
    try {
      const response = await axios.get(`${API_BASE}/recommendedWorkouts/details/${templateId}`);
      setSelectedWorkout(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedWorkout(null);
    setActiveTemplateName("");
    setActiveTemplateId(null);
    setActiveDuration(0);
    setIsActiveMode(false);
  };

  // --- RENDER HELPERS ---

  const renderWorkoutGrid = (workouts: SystemWorkout[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {workouts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '10px' }}>
                <p style={{ color: '#888', fontStyle: 'italic' }}>No workouts found here yet.</p>
            </div>
        ) : (
            workouts.map((workout) => {
              const isSaved = savedIds.has(workout.template_id);
              return (
                <div key={workout.template_id} style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <span style={{ 
                            ...badgeStyle, 
                            backgroundColor: getDifficultyColor(workout.difficulty_level) 
                        }}>
                            {workout.difficulty_level.toUpperCase()}
                        </span>
                        
                        {/* Save Button (Heart) */}
                        <button 
                            onClick={(e) => toggleSave(e, workout)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isSaved ? '#dc3545' : '#ccc', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                            title={isSaved ? "Remove from Routine" : "Add to Routine"}
                        >
                            {isSaved ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>
                    
                    <div style={{ padding: "20px", flex: 1, display:'flex', flexDirection:'column' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{workout.name}</h3>
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom:'10px' }}>
                            <FaClock color="#007bff"/> {workout.estimated_duration_min} Minutes
                        </div>

                        <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: "1.5", flex: 1 }}>
                            {workout.description}
                        </p>
                        
                        <button 
                            onClick={() => handleViewDetails(workout.template_id, workout.name, workout.estimated_duration_min)}
                            style={buttonStyle}
                        >
                            {detailsLoading && activeTemplateName === workout.name ? "Loading..." : "View Routine"}
                        </button>
                    </div>
                </div>
            )})
        )}
    </div>
  );

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading your personalized plan...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* --- HEADER & TABS --- */}
      <div style={{ marginBottom: "30px", borderBottom: "1px solid #eee" }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50', marginBottom: '20px' }}>
            {viewMode === 'recommended' && <><FaRobot style={{ color: '#007bff' }} /> Personalized For You</>}
            {viewMode === 'library' && <><FaList style={{ color: '#007bff' }} /> Workout Library</>}
            {viewMode === 'saved' && <><FaHeart style={{ color: '#dc3545' }} /> My Routine</>}
        </h2>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
            <button onClick={() => setViewMode("recommended")} style={getTabStyle(viewMode === "recommended")}>
                Recommended
            </button>
            <button onClick={() => setViewMode("library")} style={getTabStyle(viewMode === "library")}>
                Browse All
            </button>
            <button onClick={() => { setViewMode("saved"); fetchSaved(); }} style={getTabStyle(viewMode === "saved")}>
                My Routine
            </button>
        </div>
      </div>

      {/* --- VIEW 1: RECOMMENDED --- */}
      {viewMode === "recommended" && (
        <div className="animate-fade-in">
            <p style={{ color: '#666', marginBottom: '20px' }}>Based on your goal, budget, and experience level.</p>
            {renderWorkoutGrid(recommendedWorkouts)}
        </div>
      )}

      {/* --- VIEW 2: BROWSE LIBRARY --- */}
      {viewMode === "library" && (
        <div className="animate-fade-in">
            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                    <input 
                        type="text" 
                        placeholder="Search workouts (e.g. 'Abs', 'Cardio')..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>
                <select 
                    value={filterDifficulty} 
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    style={selectStyle}
                >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>
            
            {renderWorkoutGrid(libraryWorkouts)}
        </div>
      )}

      {/* --- VIEW 3: SAVED WORKOUTS --- */}
      {viewMode === "saved" && (
        <div className="animate-fade-in">
             <p style={{ color: '#666', marginBottom: '20px' }}>Your favorite workouts for quick access.</p>
             {savedWorkouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: '12px', border:'1px dashed #ccc' }}>
                    <FaHeart size={40} color="#e0e0e0" style={{ marginBottom: '15px' }} />
                    <h3 style={{color:'#666', margin: '0 0 10px 0'}}>Nothing here yet</h3>
                    <p style={{color:'#888', marginBottom:'20px'}}>Browse the library to find workouts you love.</p>
                    <button onClick={() => setViewMode("library")} style={{...buttonStyle, width:'auto', padding:'10px 30px'}}>
                        Go to Library
                    </button>
                </div>
             ) : (
                renderWorkoutGrid(savedWorkouts)
             )}
        </div>
      )}

      {/* --- MODAL LOGIC (UNCHANGED) --- */}
      {isActiveMode && selectedWorkout && activeTemplateId ? (
        <ActiveWorkoutModal
          workoutId={activeTemplateId}
          workoutName={activeTemplateName}
          exercises={selectedWorkout}
          userId={Number(userId)}
          onClose={closeDetails}
          estimatedDuration={activeDuration} // 👈 Passing correct duration!
        />
      ) : (
        selectedWorkout && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{activeTemplateName}</h3>
                <button onClick={closeDetails} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>
                  <FaTimes />
                </button>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                      <th style={thStyle}>Exercise</th>
                      <th style={thStyle}>Sets</th>
                      <th style={thStyle}>Reps</th>
                      <th style={thStyle}>Rest</th>
                      <th style={thStyle}>Demo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWorkout.map((ex, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={tdStyle}>
                          <strong>{ex.name}</strong><br/>
                          <span style={{fontSize:'0.8rem', color:'#888'}}>{ex.target_muscle}</span>
                        </td>
                        <td style={tdStyle}>{ex.sets}</td>
                        <td style={tdStyle}>{ex.reps}</td>
                        <td style={tdStyle}>{ex.rest_seconds}s</td>
                        <td style={tdStyle}>
                          {ex.video_url && (
                            <a href={ex.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#d32f2f', display:'flex', alignItems:'center', gap:'5px', textDecoration:'none' }}>
                              <FaPlayCircle /> Watch
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  style={{ ...buttonStyle, backgroundColor: "#28a745", width: "auto", padding: "10px 30px" }} 
                  onClick={() => setIsActiveMode(true)}
                >
                  Start Workout
                </button>
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
}

// --- STYLES ---

const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: isActive ? "3px solid #007bff" : "3px solid transparent",
    color: isActive ? "#007bff" : "#666",
    padding: '10px 15px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
});

const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 10px 10px 35px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
};

const selectStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minWidth: '150px'
};

const cardStyle: React.CSSProperties = { background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s ease", border: "1px solid #f0f0f0" };
const cardHeaderStyle: React.CSSProperties = { background: "#f8f9fa", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" };
const badgeStyle: React.CSSProperties = { padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", color: "white" };
const buttonStyle: React.CSSProperties = { width: "100%", marginTop: "15px", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.95rem" };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const thStyle: React.CSSProperties = { padding: "12px", color: "#444", fontWeight: "600", fontSize: "0.9rem" };
const tdStyle: React.CSSProperties = { padding: "12px", fontSize: "0.95rem", color: "#333" };

function getDifficultyColor(level: string) { switch (level) { case 'beginner': return '#28a745'; case 'intermediate': return '#ffc107'; case 'advanced': return '#dc3545'; default: return '#6c757d'; } }