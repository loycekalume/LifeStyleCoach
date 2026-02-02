import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import axiosInstance from "../../utils/axiosInstance"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- TYPES ---
type ChartKey = "weight" | "workouts" | "streak";

// Define the data shape right here
interface ProgressLog {
  date: string;
  weight: number;
  workout_done: boolean;
  current_streak: number;
}

// Define props (assuming Client type is imported or basic shape defined)
interface ProgressChartProps {
  client: { user_id: number }; // Minimal requirement
}

export default function ProgressChart({ client }: ProgressChartProps) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [currentChart, setCurrentChart] = useState<ChartKey>("weight");
  const [loading, setLoading] = useState(true);

  const userId = client.user_id;

  // --- API CALL INSIDE COMPONENT ---
  useEffect(() => {
    async function fetchProgress() {
      if (!userId) return;
      
      try {
        setLoading(true);
        // Direct call to backend
        const res = await axiosInstance.get(`/myprogress/progress/${userId}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Error loading progress logs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId]);

  // --- CHART CONFIGURATION ---
  const chartConfig = useMemo(() => {
    if (logs.length === 0) return null;

    // Format dates (e.g., "Jan 1")
    const labels = logs.map(log => 
        new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    switch (currentChart) {
      case "weight":
        return {
          labels,
          datasets: [
            {
              label: "Weight (kg)",
              data: logs.map(log => log.weight),
              borderColor: "#4ECDC4", // Teal
              backgroundColor: "rgba(78, 205, 196, 0.2)",
              tension: 0.4, // Smooth curves
              fill: true,
              pointBackgroundColor: "#4ECDC4",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
            },
          ],
        };
      case "workouts":
        return {
          labels,
          datasets: [
            {
              label: "Workouts Done",
              data: logs.map(log => (log.workout_done ? 1 : 0)),
              borderColor: "#FF6B6B", // Red
              backgroundColor: "rgba(255, 107, 107, 0.2)",
              stepped: true, // Blocky lines for boolean data
              fill: true,
              pointRadius: 3,
            },
          ],
        };
      case "streak":
        return {
          labels,
          datasets: [
            {
              label: "Streak (Days)",
              data: logs.map(log => log.current_streak),
              borderColor: "#45B7D1", // Blue
              backgroundColor: "rgba(69, 183, 209, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        };
    }
  }, [logs, currentChart]);

  // --- RENDER HELPERS ---
  if (loading) {
    return <div className="card" style={{ padding:'20px', textAlign:'center', color:'#666' }}>Loading progress...</div>;
  }

  // Empty State
  if (!chartConfig || logs.length === 0) {
      return (
        <div className="card chart-card">
            <div className="card-header"><h3>Your Progress</h3></div>
            <div className="card-content" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                <i className="fas fa-chart-line" style={{ fontSize: '2rem', marginBottom: '10px', display:'block', opacity: 0.5 }}></i>
                <p>No data yet.</p>
                <small style={{display:'block', marginTop:'5px'}}>
                    Complete a workout or log your weight to see your chart.
                </small>
            </div>
        </div>
      );
  }

  return (
    <div className="card chart-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:'10px' }}>
        <h3>Your Progress</h3>
        
        {/* Toggle Buttons */}
        <div className="chart-controls" style={{ display: 'flex', gap: '5px' }}>
          {(["weight", "workouts", "streak"] as ChartKey[]).map((key) => (
             <button
                key={key}
                onClick={() => setCurrentChart(key)}
                style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    background: currentChart === key ? '#2563eb' : 'white', // Blue active
                    color: currentChart === key ? 'white' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                }}
             >
                {key}
             </button>
          ))}
        </div>
      </div>

      <div className="card-content">
        <div className="chart-container" style={{ height: 300, position: 'relative', width: '100%' }}>
          <Line 
            data={chartConfig} 
            options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Hide legend for cleaner look
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1e293b',
                        bodyColor: '#1e293b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { display: false } // Remove vertical grid lines
                    },
                    y: {
                        beginAtZero: currentChart !== "weight", // Weight shouldn't start at 0
                        grid: { color: '#f1f5f9' }
                    }
                }
            }} 
           />
        </div>
      </div>
    </div>
  );
}