// src/components/admin/EngagementChart.tsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type Props = {
  labels: string[];
  mealLogs: number[];
  workouts: number[];
  newUsers: number[];
};

const EngagementChart: React.FC<Props> = ({ labels, mealLogs, workouts, newUsers }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const instance = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) instance.current.destroy();

    instance.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Meal Logs", data: mealLogs, backgroundColor: "#4CAF50" },
          { label: "Workouts Completed", data: workouts, backgroundColor: "#FFC107" },
          { label: "New Users", data: newUsers, backgroundColor: "#8BC34A" },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => instance.current?.destroy();
  }, [labels, mealLogs, workouts, newUsers]);

  return <canvas id="engagementChart" ref={ref} />;
};

export default EngagementChart;
