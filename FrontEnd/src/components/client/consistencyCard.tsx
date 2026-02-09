import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface ConsistencyCardProps {
  clientId: number;
}

export default function ConsistencyCard({ clientId }: ConsistencyCardProps) {
  // ✅ Explicitly typed state
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [nutritionDates, setNutritionDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Calculate Last 30 Days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progressRes, nutritionRes] = await Promise.all([
          axiosInstance.get(`/myprogress/progress/${clientId}`),
          axiosInstance.get(`/myprogress/nutrition/${clientId}`)
        ]);

        const wDates = new Set<string>(progressRes.data.map((log: any) => String(log.date)));
        const nDates = new Set<string>(nutritionRes.data.map((log: any) => String(log.date)));

        setWorkoutDates(wDates);
        setNutritionDates(nDates);
      } catch (error) {
        console.error("Error loading consistency data", error);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="card" style={{ ...styles.card, justifyContent: 'center', color: '#94a3b8' }}>
        <div className="spinner-small"></div>
      </div>
    );
  }

  return (
    <div className="card consistency-card" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>30-Day Streak</h3>
        {/* Simple Legend Inline to save space */}
        <div style={styles.miniLegend}>
            <span style={{color: '#60a5fa'}}>● Work</span>
            <span style={{color: '#34d399'}}>● Meal</span>
            <span style={{color: '#fbbf24'}}>● Both</span>
        </div>
      </div>

      <div style={styles.grid}>
        {last30Days.map((date) => {
          const hasWorkout = workoutDates.has(date);
          const hasMeal = nutritionDates.has(date);
          const isPerfect = hasWorkout && hasMeal;

          let bgColor = "#f1f5f9"; // Default (Empty)
          let title = `${date}: No Activity`;

          if (isPerfect) {
            bgColor = "#fbbf24"; // Gold
            title = `${date}: Perfect Day! 🏆`;
          } else if (hasWorkout) {
            bgColor = "#60a5fa"; // Blue
            title = `${date}: Workout Done 💪`;
          } else if (hasMeal) {
            bgColor = "#34d399"; // Green
            title = `${date}: Meal Logged 🍎`;
          }

          return (
            <div
              key={date}
              title={title}
              style={{
                ...styles.day,
                backgroundColor: bgColor,
                border: isPerfect ? "1px solid #d97706" : "1px solid transparent"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ✅ UPDATED STYLES FOR COMPACTNESS
const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "16px", // Reduced padding
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    // Remove fixed height so it hugs content
    height: "auto", 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px"
  },
  title: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1e293b"
  },
  miniLegend: {
    fontSize: "0.75rem",
    display: "flex",
    gap: "8px",
    fontWeight: "600"
  },
  grid: {
    display: "grid",
    // ✅ CHANGED: 10 columns = exactly 3 rows for 30 days (Much shorter)
    gridTemplateColumns: "repeat(10, 1fr)", 
    gap: "6px",
  },
  day: {
    // Fixed height ensures they don't stretch vertically
    height: "24px", 
    borderRadius: "4px",
    cursor: "help",
    transition: "transform 0.1s ease",
  }
};