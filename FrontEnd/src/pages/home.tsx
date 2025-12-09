import React, { useState } from "react";
import "./../styles/home.css";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaUtensils,
  FaUserMd,
  FaRobot,
  FaChartLine,
  FaUserPlus,
  FaBullseye,
  FaCalendarCheck,
  FaAward,
  FaArrowRight,
} from "react-icons/fa";

const LandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* ===== Navbar ===== */}
      {/* ===== Navbar ===== */}
      <header className="navbar">
        <div className="container">
          <div className="logo">LifeStyleCoach</div>
          <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
            <a href="#home">Home</a>
            <a href="#journey">How It Works</a>
            <a href="#features">Features</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>

          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars />
          </div>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section id="home" className="hero">
        <div className="overlay">
          <h1>
            Transform Your Life with <span>LifestyleCoach</span>
          </h1>
          <p>
            Personalized meal tracking, expert guidance, and AI-powered health
            coaching to help you achieve your wellness goals.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn primary">
              Get Started Free <FaArrowRight />
            </Link>
            <button className="btn secondary">Learn More</button>
          </div>

          <div className="stats">
            <div className="stat">
              <h2>50K+</h2>
              <p>Active Users</p>
            </div>
            <div className="stat">
              <h2>500+</h2>
              <p>Expert Coaches</p>
            </div>
            <div className="stat">
              <h2>95%</h2>
              <p>Success Rate</p>
            </div>
            <div className="stat">
              <h2>24/7</h2>
              <p>AI Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="features">
        <h2>Everything You Need to Succeed</h2>
        <p className="subtitle">
          Comprehensive tools and expert support to transform your health and wellness journey.
        </p>

        <div className="feature-cards">
          <div className="card">
            <FaUtensils className="icon green" />
            <h3>Personalized Meal Tracking</h3>
            <p>
              Track your meals with intelligent guidance based on your health goals,
              allergies, cultural preferences, and budget.
            </p>
          </div>
          <div className="card">
            <FaUserMd className="icon blue" />
            <h3>Expert Professional Support</h3>
            <p>
              Connect with certified dieticians and gym instructors for personalized meal plans and fitness programs.
            </p>
          </div>
          <div className="card">
            <FaRobot className="icon yellow" />
            <h3>AI-Powered Assistant</h3>
            <p>
              Get instant answers to nutrition, fitness, and health questions from
              our intelligent virtual assistant, available 24/7.
            </p>
          </div>
          <div className="card">
            <FaChartLine className="icon green" />
            <h3>Progress Monitoring</h3>
            <p>
              Track your journey with detailed metrics including calorie intake,
              weight changes, and workout progress.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Journey Section ===== */}
      <section id="journey1" className="journey1">
        <h2>Your Journey to Wellness</h2>
        <p className="subtitle1">
          Four simple steps to transform your lifestyle and achieve your health goals
        </p>

        <div className="steps1">
          <div className="step1">
            <div className="circle1">
              <FaUserPlus /> <span>1</span>
            </div>
            <h3>Create Your Profile</h3>
            <p>Tell us about your health goals, dietary preferences, allergies, and budget. We'll customize everything for you.</p>
          </div>
          <div className="step1">
            <div className="circle1">
              <FaBullseye /> <span>2</span>
            </div>
            <h3>Get Matched</h3>
            <p>Connect with expert dieticians and trainers who understand your unique needs and background.</p>
          </div>
          <div className="step1">
            <div className="circle1">
              <FaCalendarCheck /> <span>3</span>
            </div>
            <h3>Follow Your Plan</h3>
            <p>Receive personalized meal plans, workout routines, and daily guidance.</p>
          </div>
          <div className="step1">
            <div className="circle1">
              <FaAward /> <span>4</span>
            </div>
            <h3>Track & Achieve</h3>
            <p>Monitor your progress, celebrate milestones, and adjust your plan as you grow stronger.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>
            Join thousands already transforming their lives through personalized
            health and fitness coaching.
          </p>
          <Link to="/signup" className=" cta-btn">
            Sign Up Free
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer>
        <div className="footer-container">
          <div className="footer-col">
            <h3>LifestyleCoach</h3>
            <p>Empowering individuals to take control of their health through AI-powered coaching and expert guidance.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 LifestyleCoach. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
