import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ClientProgressProps {
  clientId: string;
  clientName: string;
}

// Dummy Data (replace with API data later)
const weightProgressData = [
  { week: "Week 1", weight: 82 },
  { week: "Week 2", weight: 81 },
  { week: "Week 3", weight: 79.5 },
  { week: "Week 4", weight: 78 },
];

const mealAdherenceData = [
  { week: "Week 1", adherence: 70 },
  { week: "Week 2", adherence: 80 },
  { week: "Week 3", adherence: 60 },
  { week: "Week 4", adherence: 90 },
];

const macroBreakdownData = [
  { name: "Protein", value: 30 },
  { name: "Carbs", value: 45 },
  { name: "Fats", value: 25 },
];

const COLORS = ["#2ecc71", "#f1c40f", "#27ae60"]; // green + yellow theme

const ClientProgress: React.FC<ClientProgressProps> = ({ clientId, clientName }) => {
  return (
    <div className="client-progress-container p-6 mt-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        Progress Overview – {clientName}
      </h2>

      {/* === Weight Progress === */}
      <div className="chart-card mb-10 bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-green-600">Weight Progress</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weightProgressData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#2ecc71" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === Meal Plan Adherence === */}
      <div className="chart-card mb-10 bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-green-600">Meal Plan Adherence (%)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mealAdherenceData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="adherence" fill="#f1c40f" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Macro Breakdown === */}
      <div className="chart-card bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-green-600">Macro Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={macroBreakdownData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {macroBreakdownData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientProgress;
