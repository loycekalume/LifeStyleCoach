import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/instructor.css";

interface Log {
    log_id: number;
    workout_title: string;
    date_completed: string;
    duration_minutes: number;
    rating: number; // 1-5
    client_notes: string;
}

const ClientProgress: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const [logs, setLogs] = useState<Log[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalMinutes: 0, sessionCount: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch logs for this specific client
                const res = await axiosInstance.get(`/workoutLogs/logs/${clientId}`);
                setLogs(res.data);
                processChartData(res.data);
            } catch (error) {
                console.error("Error loading progress", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    const processChartData = (data: Log[]) => {
        // 1. Sort by Date (Oldest to Newest)
        const sorted = [...data].sort((a, b) => new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime());

        // 2. Map for Graph
        const mapped = sorted.map(log => ({
            date: new Date(log.date_completed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            minutes: log.duration_minutes,
            intensity: log.rating,
            title: log.workout_title // For tooltip
        }));

        // 3. Calculate Totals
        const totalMin = data.reduce((acc, curr) => acc + curr.duration_minutes, 0);
        setStats({ totalMinutes: totalMin, sessionCount: data.length });

        // 4. Show last 10 sessions on graph
        setChartData(mapped.slice(-10));
    };

    // Helper for Intensity Colors
    const getBarColor = (rating: number) => {
        if (rating >= 5) return '#ef4444'; // Red (Hard)
        if (rating >= 3) return '#3b82f6'; // Blue (Moderate)
        return '#10b981'; // Green (Easy)
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{data.title}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>⏱ {data.minutes} mins</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>🔥 Intensity: {data.intensity}/5</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="container">Loading progress...</div>;

    return (
        <div className="container">

            {/* Header */}
            <div className="card-header flex justify-between items-center">
                <div>
                    <h2>Client Analytics</h2>
                    <p style={{ color: '#666' }}>Tracking consistency and intensity</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back to List</button>
            </div>

            {/* 📊 TOP SECTION: STATS & GRAPH */}
            <div className="progress-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', marginTop: '20px' }}>

                {/* Left: Summary Card */}
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '3rem', color: '#2563eb', margin: 0 }}>{stats.sessionCount}</h1>
                        <span style={{ color: '#666' }}>Sessions Completed</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>{Math.round(stats.totalMinutes / 60)}</h1>
                        <span style={{ color: '#666' }}>Total Hours</span>
                    </div>
                </div>


                {/* Right: The Graph */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3>Activity Last 10 Sessions</h3>

                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', minWidth: 0 }}>

                            {/* 1. CHART CONTAINER (Fixed Height) */}
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getBarColor(entry.intensity)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 2. LEGEND CONTAINER (Sits naturally below the chart) */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '20px',
                                marginTop: '15px',
                                paddingTop: '15px',
                                borderTop: '1px solid #f3f4f6'
                            }}>
                                {/* Light Item */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: 16, height: 16, background: '#10b981', borderRadius: 4 }}></span>
                                    <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Light</span>
                                </div>

                                {/* Moderate Item */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: 16, height: 16, background: '#3b82f6', borderRadius: 4 }}></span>
                                    <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Moderate</span>
                                </div>

                                {/* Hard Item */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: 16, height: 16, background: '#ef4444', borderRadius: 4 }}></span>
                                    <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Hard</span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                            No workout data recorded yet.
                        </div>
                    )}
                </div>
            </div>

            {/* 📝 BOTTOM SECTION: DETAILED LOG HISTORY */}
            <div className="logs-timeline" style={{ marginTop: '30px' }}>
                <h3>Detailed Session Logs</h3>
                {logs.length > 0 ? (
                    [...logs].reverse().map((log) => ( // Reverse to show Newest first
                        <div key={log.log_id} className="log-entry-card" style={{ marginBottom: '15px', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', borderLeft: `5px solid ${getBarColor(log.rating)}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h4 style={{ margin: 0 }}>{log.workout_title}</h4>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                    {new Date(log.date_completed).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#444' }}>
                                <span>⏱ <strong>{log.duration_minutes}</strong> mins</span>
                                <span>🔥 Rating: <strong>{log.rating}/5</strong></span>
                            </div>

                            {log.client_notes && (
                                <div style={{ marginTop: '10px', background: '#f9fafb', padding: '10px', borderRadius: '6px', fontStyle: 'italic' }}>
                                    "{log.client_notes}"
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No logs found.</p>
                )}
            </div>

        </div>
    );
};

export default ClientProgress;