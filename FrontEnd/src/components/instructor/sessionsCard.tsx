import React from 'react';

const UpcomingSessions: React.FC = () => {


    return (
        <div className="card sessions-card">
            <div className="card-header">
                <h3><i className="fas fa-calendar"></i> Upcoming Sessions</h3>
                <button className="btn btn-ghost">View Schedule</button>
            </div>
            <div className="card-content">
                <div className="sessions-list">
                    <div className="session-item">
                        <div className="session-info">
                            <div className="session-avatar">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Sarah Johnson"/>
                            </div>
                            <div className="session-details">
                                <div className="session-client">Sarah Johnson</div>
                                <div className="session-type">Yoga Session • 60 min</div>
                                <div className="session-time">Today, 2:00 PM</div>
                            </div>
                        </div>
                        <div className="session-actions">
                            <span className="badge badge-success">confirmed</span>
                            <button className="btn btn-icon">
                                <i className="fas fa-comment"></i>
                            </button>
                            <button className="btn btn-icon">
                                <i className="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                    <div className="session-item">
                        <div className="session-info">
                            <div className="session-avatar">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Mike Chen"/>
                            </div>
                            <div className="session-details">
                                <div className="session-client">Mike Chen</div>
                                <div className="session-type">Strength Training • 45 min</div>
                                <div className="session-time">Today, 4:30 PM</div>
                            </div>
                        </div>
                        <div className="session-actions">
                            <span className="badge badge-success">confirmed</span>
                            <button className="btn btn-icon">
                                <i className="fas fa-comment"></i>
                            </button>
                            <button className="btn btn-icon">
                                <i className="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                    <div className="session-item">
                        <div className="session-info">
                            <div className="session-avatar">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" alt="Emma Rodriguez"/>
                            </div>
                            <div className="session-details">
                                <div className="session-client">Emma Rodriguez</div>
                                <div className="session-type">HIIT Workout • 30 min</div>
                                <div className="session-time">Tomorrow, 9:00 AM</div>
                            </div>
                        </div>
                        <div className="session-actions">
                            <span className="badge badge-warning">pending</span>
                            <button className="btn btn-icon">
                                <i className="fas fa-comment"></i>
                            </button>
                            <button className="btn btn-icon">
                                <i className="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                    <div className="session-item">
                        <div className="session-info">
                            <div className="session-avatar">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="David Kim"/>
                            </div>
                            <div className="session-details">
                                <div className="session-client">David Kim</div>
                                <div className="session-type">Pilates • 50 min</div>
                                <div className="session-time">Tomorrow, 11:00 AM</div>
                            </div>
                        </div>
                        <div className="session-actions">
                            <span className="badge badge-success">confirmed</span>
                            <button className="btn btn-icon">
                                <i className="fas fa-comment"></i>
                            </button>
                            <button className="btn btn-icon">
                                <i className="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingSessions;
