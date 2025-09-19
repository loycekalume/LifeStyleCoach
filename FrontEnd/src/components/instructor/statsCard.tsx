import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MonthlyStats: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sessions',
            data: [20, 35, 25, 40, 30, 45],
            backgroundColor: '#4CAF50',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <div className="card chart-card">
                    <div className="card-header">
                        <h3><i className="fas fa-dollar-sign"></i> Weekly Earnings</h3>
                    </div>
                    <div className="card-content">
                        <div className="chart-container">
                            <canvas id="earningsChart" ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
   
  );
};

export default MonthlyStats;
