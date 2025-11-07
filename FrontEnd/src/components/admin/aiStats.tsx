// src/components/admin/AIStats.tsx
import React, { useEffect } from "react";

const animate = () => {
  document.querySelectorAll(".ai-metric-card strong").forEach((el) => {
    const text = (el.textContent || "").trim();
    const isPercent = text.includes("%");
    const target = parseFloat(text.replace(/%|,/g, ""));
    if (isNaN(target)) return;
    let count = 0;
    const step = target / 60;
    const update = () => {
      count += step;
      if (count < target) {
        el.textContent = isPercent ? count.toFixed(1) + "%" : Math.floor(count).toLocaleString();
        requestAnimationFrame(update);
      } else {
        el.textContent = isPercent ? target.toFixed(1) + "%" : target.toLocaleString();
      }
    };
    update();
  });
};

const AIStats: React.FC = () => {
  useEffect(() => {
    animate();
  }, []);

  return (
    <div className="ai-stats">
      <h2><i className="fas fa-robot"></i> AI Coach Performance</h2>
      <div className="ai-stats-grid">
        <div className="ai-metric-card">
          <i className="fas fa-question-circle icon" />
          <div><span>Total AI Queries</span><strong>89000</strong></div>
        </div>

        <div className="ai-metric-card">
          <i className="fas fa-user-check icon" />
          <div><span>Expert Handoffs</span><strong>1.2%</strong></div>
        </div>

        <div className="ai-metric-card">
          <i className="fas fa-seedling icon" />
          <div><span>Meal Plan Success</span><strong>95%</strong></div>
        </div>
      </div>
    </div>
  );
};

export default AIStats;
