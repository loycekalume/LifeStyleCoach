import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
// 1. Import Client type
import { type ProgressLog, getProgressLogsByUserId, type Client } from "../../Services/clientViewService";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type ChartKey = "weight" | "workouts" | "streak";

// 2. Define the interface
interface ProgressChartProps {
  client: Client;
}

// 3. Accept the prop
export default function ProgressChart({ client }: ProgressChartProps) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [currentChart, setCurrentChart] = useState<ChartKey>("weight");
  const [loading, setLoading] = useState(true);

  // 4. Use the real ID from the prop
  const userId = client.user_id;

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getProgressLogsByUserId(userId);
        setLogs(data);
      } catch (err) {
        console.error("Error loading progress logs:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
        loadLogs();
    }
  }, [userId]); // 5. Add userId as dependency so it updates if client changes

  const chartConfig = useMemo(() => {
    if (logs.length === 0) return null;

    const labels = logs.map(log => log.date);

    switch (currentChart) {
      case "weight":
        return {
          labels,
          datasets: [
            {
              label: "Weight",
              data: logs.map(log => log.weight),
              borderColor: "#4ECDC4",
              backgroundColor: "#4ECDC420",
              tension: 0.4,
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
              borderColor: "#FF6B6B",
              backgroundColor: "#FF6B6B20",
              stepped: true,
              fill: true,
            },
          ],
        };
      case "streak":
        return {
          labels,
          datasets: [
            {
              label: "Current Streak",
              data: logs.map(log => log.current_streak),
              borderColor: "#45B7D1",
              backgroundColor: "#45B7D120",
              fill: false,
              tension: 0.3,
            },
          ],
        };
    }
  }, [logs, currentChart]);

  if (loading) {
    return <div className="card p-4 flex justify-center">Loading progress...</div>;
  }

  // Handle empty state if no logs found
  if (!chartConfig) {
      return (
        <div className="card chart-card">
            <div className="card-header"><h3>Progress</h3></div>
            <div className="card-content" style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                No progress data logged yet.
            </div>
        </div>
      );
  }

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3>Progress</h3>
        <div className="chart-controls">
          <button
            className={`chart-btn ${currentChart === "weight" ? "active" : ""}`}
            onClick={() => setCurrentChart("weight")}
          >
            Weight
          </button>
          <button
            className={`chart-btn ${currentChart === "workouts" ? "active" : ""}`}
            onClick={() => setCurrentChart("workouts")}
          >
            Workouts
          </button>
          <button
            className={`chart-btn ${currentChart === "streak" ? "active" : ""}`}
            onClick={() => setCurrentChart("streak")}
          >
            Streak
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="chart-container" style={{ height: 300 }}>
          <Line data={chartConfig} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}