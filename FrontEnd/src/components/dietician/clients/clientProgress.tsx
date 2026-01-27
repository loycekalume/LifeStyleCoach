import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFire, FaWeight, FaCalendarCheck, FaChartPie } from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axiosInstance from "../../../utils/axiosInstance";

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function ClientProgress() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
        try {
            const res = await axiosInstance.get(`/dieticianClients/progress/${clientId}`);
            setData(res.data);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchProgress();
  }, [clientId]);

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Loading Client Analytics...</div>;
  if (!data) return <div>No data found.</div>;

  // --- Chart 1: Calorie Trend ---
  const calorieChartData = {
    labels: data.logs.map((l: any) => new Date(l.log_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})),
    datasets: [
      {
        label: 'Calories Consumed',
        data: data.logs.map((l: any) => l.daily_calories),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Target (Est.)',
        data: data.logs.map(() => 2000), // Hardcoded target for visualization
        borderColor: '#10b981',
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  // --- Chart 2: Macro Split ---
  const macroChartData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
        data: [data.averages.protein, data.averages.carbs, data.averages.fats],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 0
    }]
  };

  return (
    <div className="progress-page" style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <FaArrowLeft /> Back to Roster
        </button>

        <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{data.client_name}'s Progress</h1>
            <p style={{ color: '#64748b', margin: 0 }}>Goal: <span style={{textTransform:'capitalize', fontWeight:'600'}}>{data.weight_goal}</span></p>
        </div>

        {/* 1. Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <StatCard 
                icon={<FaCalendarCheck />} 
                value={`${data.consistency}%`} 
                label="30-Day Consistency" 
                color="#3b82f6" 
            />
            <StatCard 
                icon={<FaFire />} 
                value={`${data.averages.calories} kcal`} 
                label="Avg. Daily Intake" 
                color="#f59e0b" 
            />
            <StatCard 
                icon={<FaWeight />} 
                value={`${data.current_weight} kg`} 
                label="Current Weight" 
                color="#10b981" 
            />
        </div>

        {/* 2. Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            
            {/* Calorie Line Chart */}
            <div style={chartCardStyle}>
                <h3 style={chartTitleStyle}>Calorie Adherence</h3>
                <div style={{ height: '300px' }}>
                    <Line 
                        data={calorieChartData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }} 
                    />
                </div>
            </div>

            {/* Macro Doughnut Chart */}
            <div style={chartCardStyle}>
                <h3 style={chartTitleStyle}><FaChartPie style={{marginRight:'8px'}}/>Avg. Macro Split</h3>
                <div style={{ height: '300px', display:'flex', justifyContent:'center' }}>
                    <Doughnut 
                        data={macroChartData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }} 
                    />
                </div>
                {/* Macro Legend Text */}
                <div style={{textAlign:'center', marginTop:'15px', fontSize:'0.9rem', color:'#666'}}>
                    <span>{data.averages.protein}g Protein</span> • <span>{data.averages.carbs}g Carbs</span> • <span>{data.averages.fats}g Fats</span>
                </div>
            </div>

        </div>
    </div>
  );
}

// --- Sub-components & Styles ---

const StatCard = ({ icon, value, label, color }: any) => (
    <div style={{
        background: 'white', padding: '24px', borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '20px'
    }}>
        <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            background: `${color}15`, color: color, fontSize: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{value}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{label}</div>
        </div>
    </div>
);

const backButtonStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
    fontWeight: '600'
};

const chartCardStyle: React.CSSProperties = {
    background: 'white', padding: '25px', borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
};

const chartTitleStyle: React.CSSProperties = {
    margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155'
};