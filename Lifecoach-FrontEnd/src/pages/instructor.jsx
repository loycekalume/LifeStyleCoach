import React, { useEffect } from "react";
import "./instructor.css"; // keep your styles here
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function InstructorProfile() {
  useEffect(() => {
    const ctx = document.getElementById("earningsChart");
    if (ctx) {
      new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Daily Earnings",
              data: [180, 240, 160, 220, 280, 320, 200],
              backgroundColor: "#00C853",
              borderColor: "#00C853",
              borderWidth: 1,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f0f0f0" },
              ticks: { callback: (value) => `$${value}` },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }
  }, []);

  const handleAvatarEdit = () => alert("Avatar edit functionality here");
  const handleSettings = () => alert("Settings page would open here");
  const handleAnalytics = () => alert("Analytics dashboard would open here");

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Instructor Profile</h1>
            <div className="header-actions">
              <button className="btn btn-outline analytics-btn" onClick={handleAnalytics}>
                <i className="fas fa-chart-bar"></i> Analytics
              </button>
              <button className="btn btn-outline settings-btn" onClick={handleSettings}>
                <i className="fas fa-cog"></i> Settings
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            {/* Profile Card */}
            <div className="card profile-card">
              <div className="profile-header">
                <div className="profile-avatar-container">
                  <div className="profile-avatar">
                    <img
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
                      alt="Maria Rodriguez"
                    />
                    <button className="avatar-edit-btn" onClick={handleAvatarEdit}>
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
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Los Angeles, CA</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>5 years exp.</span>
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

            {/* Contact & Availability */}
            <div className="card contact-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-user"></i> Contact & Availability
                </h3>
              </div>
              <div className="card-content">
                <div className="contact-list">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>maria.rodriguez@email.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+1 (555) 987-6543</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-globe"></i>
                    <span>www.mariafit.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-clock"></i>
                    <span>Mon-Fri: 6AM-8PM</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>In-person & Online sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="card specializations-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-award"></i> Specializations
                </h3>
              </div>
              <div className="card-content">
                <div className="badges-container">
                  <span className="badge badge-primary">HIIT Training</span>
                  <span className="badge badge-secondary">Strength Training</span>
                  <span className="badge badge-accent">Cardio</span>
                  <span className="badge badge-primary">Weight Loss</span>
                  <span className="badge badge-secondary">Nutrition</span>
                  <span className="badge badge-accent">Rehabilitation</span>
                </div>
                <div className="certifications">
                  <h4>Certifications</h4>
                  <ul>
                    <li>• ACSM Certified Personal Trainer</li>
                    <li>• NASM Corrective Exercise Specialist</li>
                    <li>• Precision Nutrition Level 1</li>
                    <li>• CPR/AED Certified</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card pricing-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-dollar-sign"></i> Session Pricing
                </h3>
              </div>
              <div className="card-content">
                <div className="pricing-list">
                  <div className="pricing-item">
                    <span>1-on-1 Session</span>
                    <span className="price">$75/hour</span>
                  </div>
                  <div className="pricing-item">
                    <span>Group Session (2-4)</span>
                    <span className="price">$45/hour</span>
                  </div>
                  <div className="pricing-item">
                    <span>Online Session</span>
                    <span className="price">$50/hour</span>
                  </div>
                  <div className="pricing-item">
                    <span>Package (10 sessions)</span>
                    <span className="price">$650</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content (charts, reviews, bio, etc.) */}
          <main className="profile-main">
            {/* Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-dollar-sign"></i> Weekly Earnings
                </h3>
              </div>
              <div className="card-content">
                <div className="chart-container">
                  <canvas id="earningsChart"></canvas>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card bio-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-user"></i> About Me
                </h3>
              </div>
              <div className="card-content">
                <p>
                  Passionate fitness instructor with over 5 years of experience helping clients
                  achieve their health and wellness goals. Specialized in HIIT training, strength
                  building, and sustainable weight loss programs.
                </p>
                <p>
                  My approach combines evidence-based training methods with nutritional guidance to
                  ensure lasting results. Whether you're a beginner or an experienced athlete, I'm
                  here to support your fitness journey every step of the way.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default InstructorProfile;
