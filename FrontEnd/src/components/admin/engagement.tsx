import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type Props = {
  labels: string[];
  mealLogs: number[];
  workouts: number[];
  newUsers: number[];
};

const EngagementChart: React.FC<Props> = ({ labels, mealLogs, workouts, newUsers }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // ✅ CLEANUP: Destroy existing chart instance to prevent "Canvas is already in use" error
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new Chart instance
    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Meal Logs",
            data: mealLogs,
            backgroundColor: "rgba(76, 175, 80, 0.7)", // Green
            borderColor: "rgba(76, 175, 80, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "Workouts Completed",
            data: workouts,
            backgroundColor: "rgba(255, 193, 7, 0.7)", // Amber
            borderColor: "rgba(255, 193, 7, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "New Users",
            data: newUsers,
            backgroundColor: "rgba(33, 150, 243, 0.7)", // Blue
            borderColor: "rgba(33, 150, 243, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows chart to fill container height
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#333",
            bodyColor: "#666",
            borderColor: "#ddd",
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#f0f0f0",
            },
            ticks: {
              stepSize: 1, // Avoid decimals for counts
            }
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      },
    });

    // Cleanup function when component unmounts or data changes
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, mealLogs, workouts, newUsers]);

  return (
    <div style={{ position: "relative", height: "300px", width: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default EngagementChart;