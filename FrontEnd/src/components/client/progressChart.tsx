import { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import axiosInstance from "../../utils/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// ===========================
// TYPES
// ===========================
interface ProgressLog {
  date: string;
  weight: number;
  bmi: number;
  total_workouts: number;
}

interface NutritionLog {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals_logged: number;
}

interface DashboardStats {
  workouts: {
    total_workouts: number;
    avg_rating: number;
    total_minutes: number;
  };
  nutrition: {
    days_logged: number;
    avg_calories: number;
  };
  streak: {
    current_streak: number;
    workout_done: boolean;
    meals_logged: boolean;
  };
}

interface ClientProgressDashboardProps {
  client: { user_id: number };
}

type TimeRange = "7d" | "30d" | "90d" | "all";

// ===========================
// MAIN COMPONENT
// ===========================
export default function ClientProgressDashboard({ client }: ClientProgressDashboardProps) {
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);

  const userId = client.user_id;

  // ===========================
  // DATA FETCHING
  // ===========================
  useEffect(() => {
    async function fetchAllData() {
      if (!userId) return;
      try {
        setLoading(true);
        const [progressRes, nutritionRes, statsRes] = await Promise.all([
          axiosInstance.get(`/myprogress/progress/${userId}`),
          axiosInstance.get(`/myprogress/nutrition/${userId}`),
          axiosInstance.get(`/myprogress/dashboard/${userId}`)
        ]);

        // ✅ CRITICAL FIX: Sort data by date (Oldest -> Newest)
        // This ensures the line graph draws from left to right correctly.
        const sortedProgress = progressRes.data.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const sortedNutrition = nutritionRes.data.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setProgressLogs(sortedProgress);
        setNutritionLogs(sortedNutrition);
        setDashboardStats(statsRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [userId]);

  // ===========================
  // FILTER DATA BY TIME RANGE
  // ===========================
  const filterByTimeRange = <T extends { date: string }>(data: T[]): T[] => {
    if (timeRange === "all") return data;

    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const cutoffDate = new Date(now.getTime() - daysMap[timeRange] * 24 * 60 * 60 * 1000);

    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredProgress = filterByTimeRange(progressLogs);
  const filteredNutrition = filterByTimeRange(nutritionLogs);

  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <div className="dashboard-loading" style={styles.loading}>
        <div className="spinner" style={styles.spinner}></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  // ===========================
  // EMPTY STATE
  // ===========================
  if (progressLogs.length === 0 && nutritionLogs.length === 0) {
    return (
      <div className="dashboard-empty" style={styles.emptyState}>
        <h2>Start Your Journey! 🎯</h2>
        <p>Log your first workout or meal to begin tracking your progress.</p>
      </div>
    );
  }

  return (
    <div className="client-progress-dashboard" style={styles.container}>
      {/* HEADER */}
      <div className="dashboard-header" style={styles.header}>
        <h2 style={styles.title}>Your Progress Dashboard</h2>
        <div className="time-range-selector" style={styles.timeRangeContainer}>
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={timeRange === range ? styles.timeButtonActive : styles.timeButton}
            >
              {range === "7d" && "7 Days"}
              {range === "30d" && "30 Days"}
              {range === "90d" && "3 Months"}
              {range === "all" && "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-grid" style={styles.metricsGrid}>
        <MetricCard
          title="Current Streak"
          value={dashboardStats?.streak?.current_streak || 0}
          unit="days"
          icon="🔥"
          color="#f59e0b"
        />
        <MetricCard
          title="Workouts (30d)"
          value={dashboardStats?.workouts?.total_workouts || 0}
          unit="sessions"
          icon="💪"
          color="#3b82f6"
        />
        <MetricCard
          title="Avg Calories"
          value={Math.round(dashboardStats?.nutrition?.avg_calories || 0)}
          unit="kcal/day"
          icon="🍎"
          color="#10b981"
        />
        <MetricCard
          title="Total Minutes"
          value={dashboardStats?.workouts?.total_minutes || 0}
          unit="mins"
          icon="⏱️"
          color="#8b5cf6"
        />
      </div>

      {/* CHARTS */}
      <div className="charts-grid" style={styles.chartsGrid}>
        {/* Weight & BMI Chart */}
        <WeightBMIChart data={filteredProgress} />

        {/* Nutrition Chart */}
        <NutritionChart data={filteredNutrition} />

        {/* Workout Activity Chart */}
        <WorkoutActivityChart data={filteredProgress} />

        {/* Macro Distribution */}
        <MacroDistributionChart data={filteredNutrition} />
      </div>

      {/* CALENDAR */}
      <ConsistencyCalendar
        progressLogs={progressLogs}
        nutritionLogs={nutritionLogs}
      />
    </div>
  );
}

// ===========================
// METRIC CARD COMPONENT
// ===========================
interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}

function MetricCard({ title, value, unit, icon, color }: MetricCardProps) {
  return (
    <div className="metric-card" style={{ ...styles.metricCard, borderLeftColor: color }}>
      <div style={styles.metricIcon}>{icon}</div>
      <div style={styles.metricContent}>
        <p style={styles.metricTitle}>{title}</p>
        <h3 style={styles.metricValue}>
          {value.toLocaleString()} <span style={styles.metricUnit}>{unit}</span>
        </h3>
      </div>
    </div>
  );
}

// ===========================
// WEIGHT & BMI CHART (Standard: X=Date, Y=Weight)
// ===========================
function WeightBMIChart({ data }: { data: ProgressLog[] }) {
  if (data.length === 0) return null;

  // Format Dates for X-Axis
  const labels = data.map(log =>
    new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Weight (kg)",
        data: data.map(log => log.weight),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointRadius: 6, // Larger dots to see the entries clearly
        pointHoverRadius: 8,
        tension: 0.3, // Curve slightly to show "flow"
        fill: true,
        yAxisID: "y",
      },
      {
        label: "BMI",
        data: data.map(log => log.bmi),
        borderColor: "#10b981",
        backgroundColor: "transparent",
        pointRadius: 0, // Hide dots for BMI to reduce clutter
        borderDash: [5, 5], // Dashed line for BMI
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1e293b",
        bodyColor: "#334155",
        borderColor: "#e2e8f0",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: "Timeline (Days)" } 
      },
      y: { 
        type: "linear" as const, 
        display: true, 
        position: "left" as const, 
        title: { display: true, text: "Weight (kg)" },
        grid: { color: "#f1f5f9" }
      },
      y1: { 
        type: "linear" as const, 
        display: true, 
        position: "right" as const, 
        title: { display: true, text: "BMI" }, 
        grid: { drawOnChartArea: false } 
      },
    },
  };

  return (
    <div className="chart-card" style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Weight Trend</h3>
      <div style={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

// ===========================
// NUTRITION CHART (Line Graph)
// ===========================
function NutritionChart({ data }: { data: NutritionLog[] }) {
  if (data.length === 0) {
    return (
      <div className="chart-card" style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Daily Calorie Intake</h3>
        <div style={styles.emptyChart}>No nutrition data logged yet</div>
      </div>
    );
  }

  const labels = data.map(log =>
    new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: data.map(log => log.total_calories),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#f59e0b",
        pointRadius: 4,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Calories" } },
      x: { grid: { display: false } }
    },
  };

  return (
    <div className="chart-card" style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Daily Calorie Intake</h3>
      <div style={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

// ===========================
// WORKOUT ACTIVITY CHART (Line Graph)
// ===========================
function WorkoutActivityChart({ data }: { data: ProgressLog[] }) {
  if (data.length === 0) return null;

  const labels = data.map(log =>
    new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Workouts",
        data: data.map(log => log.total_workouts),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#8b5cf6",
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1 },
        title: { display: true, text: "Count" }
      },
      x: { grid: { display: false } }
    },
  };

  return (
    <div className="chart-card" style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Workout Frequency</h3>
      <div style={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

// ===========================
// MACRO DISTRIBUTION CHART
// ===========================
function MacroDistributionChart({ data }: { data: NutritionLog[] }) {
  if (data.length === 0) {
    return (
      <div className="chart-card" style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Macro Distribution</h3>
        <div style={styles.emptyChart}>No nutrition data available</div>
      </div>
    );
  }

  const totalProtein = data.reduce((sum, log) => sum + log.total_protein, 0);
  const totalCarbs = data.reduce((sum, log) => sum + log.total_carbs, 0);
  const totalFats = data.reduce((sum, log) => sum + log.total_fats, 0);

  const chartData = {
    labels: ["Protein", "Carbs", "Fats"],
    datasets: [
      {
        data: [totalProtein, totalCarbs, totalFats],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  return (
    <div className="chart-card" style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Macro Distribution (Total)</h3>
      <div style={styles.chartContainer}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

// ===========================
// CONSISTENCY CALENDAR
// ===========================
function ConsistencyCalendar({
  progressLogs,
  nutritionLogs,
}: {
  progressLogs: ProgressLog[];
  nutritionLogs: NutritionLog[];
}) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const workoutDates = new Set(progressLogs.map(log => new Date(log.date).toISOString().split("T")[0]));
  const nutritionDates = new Set(nutritionLogs.map(log => new Date(log.date).toISOString().split("T")[0]));

  return (
    <div className="consistency-calendar" style={styles.calendarCard}>
      <h3 style={styles.chartTitle}>30-Day Consistency</h3>
      <div style={styles.calendarGrid}>
        {last30Days.map(date => {
          const hasWorkout = workoutDates.has(date);
          const hasMeal = nutritionDates.has(date);
          const isPerfect = hasWorkout && hasMeal;

          let bgColor = "#f1f5f9"; 
          if (isPerfect) bgColor = "#fbbf24"; 
          else if (hasWorkout) bgColor = "#60a5fa"; 
          else if (hasMeal) bgColor = "#34d399"; 

          return (
            <div
              key={date}
              title={date}
              style={{
                ...styles.calendarDay,
                backgroundColor: bgColor,
              }}
            />
          );
        })}
      </div>
      <div style={styles.calendarLegend}>
        <span style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#60a5fa" }} /> Workout
        </span>
        <span style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#34d399" }} /> Meal
        </span>
        <span style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#fbbf24" }} /> Perfect Day
        </span>
      </div>
    </div>
  );
}

// ===========================
// STYLES
// ===========================
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },
  timeRangeContainer: {
    display: "flex",
    gap: "8px",
    background: "#f1f5f9",
    padding: "4px",
    borderRadius: "8px",
  },
  timeButton: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  timeButtonActive: {
    padding: "8px 16px",
    border: "none",
    background: "white",
    color: "#0f172a",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    borderLeft: "4px solid",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  metricIcon: {
    fontSize: "32px",
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  metricValue: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  metricUnit: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  chartCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  chartTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
  },
  chartContainer: {
    height: "300px",
    position: "relative",
  },
  emptyChart: {
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
  calendarCard: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(30px, 1fr))",
    gap: "6px",
    marginBottom: "16px",
  },
  calendarDay: {
    aspectRatio: "1",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  calendarLegend: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    fontSize: "14px",
    color: "#64748b",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "3px",
  },
};