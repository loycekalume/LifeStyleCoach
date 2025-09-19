import React from 'react';

const ProfileCard: React.FC = () => {
  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
              alt="Maria Rodriguez"
            />
            <button className="avatar-edit-btn">
              <i className="fas fa-camera"></i>
            </button>
            <div className="verified-badge">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        <h2 className="profile-name">Maria Rodriguez</h2>
        <p className="profile-title">Certified Fitness Instructor</p>
        <div className="profile-rating">
          <i className="fas fa-star"></i>
          <span className="rating-value">4.9</span>
          <span className="rating-count">(89 reviews)</span>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <i className="fas fa-map-marker-alt"></i> <span>Los Angeles, CA</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-calendar"></i> <span>5 years exp.</span>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">47</div>
            <div className="stat-label">Active Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">156</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
