import React, { useState } from "react";
import "../styles/Login.css";


interface LoginResponse {
  token?: string;
  message?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password_hash:password }),
      credentials:"include"
    });

    const data: LoginResponse = await response.json();
    console.log("Raw response:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    console.log("Login success:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    // Example: redirect to dashboard
    // navigate("/dashboard");

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      alert(error.message);
    } else {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
};

  return (
    <div className="auth-container">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h1>LifeStyle Coach</h1>
          </div>
          <div className="branding-text">
            <h2>Welcome Back!</h2>
            <p>
              Continue your health journey with personalized nutrition and
              fitness guidance.
            </p>
          </div>
          <div className="features-list">
            <div className="feature-item">
              <i className="fas fa-apple-alt"></i>
              <span>Smart Meal Planning</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-dumbbell"></i>
              <span>Expert Fitness Coaching</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-robot"></i>
              <span>24/7 AI Nutrition Coach</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-users"></i>
              <span>Supportive Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-container">
        <div className="auth-form">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn-primary">
              <span>Sign In</span>
              <i className="fas fa-arrow-right"></i>
            </button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-login">
              <button type="button" className="btn-social google">
                <i className="fab fa-google"></i>
                <span>Google</span>
              </button>
              <button type="button" className="btn-social facebook">
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </button>
              <button type="button" className="btn-social apple">
                <i className="fab fa-apple"></i>
                <span>Apple</span>
              </button>
            </div>

            <div className="form-footer">
              <p>
                Don&apos;t have an account?{" "}
                <a href="signup.html" className="signup-link">
                  Sign up here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
