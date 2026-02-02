import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Use raw axios to avoid interceptor redirects on login failure
import "../styles/Login.css";

// Define a map to convert backend role_id (number) to frontend role (string)
const ROLE_MAP: { [key: number]: "Client" | "Instructor" | "Dietician" | "Admin" } = {
  3: "Instructor",
  4: "Dietician",
  5: "Client", 
  1: "Admin",
};

// Define the interface to match the backend response
interface LoginResponse {
  token?: string;
  message?: string;
  user?: {
    id: number; // usually user_id
    user_id?: number; // fallback if backend names it differently
    email: string;
    name: string;
    role_id: number; 
    profile_complete: boolean;
    instructor_id?: number; 
    dietician_id?: number; // Added for completeness
  };
}

// Utility function to safely get the role string
const getRoleString = (roleId: number): "Client" | "Instructor" | "Dietician" | "Admin" | null => {
  return ROLE_MAP[roleId] || null;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ Added loading state

  // Get API URL from env, similar to your axiosInstance
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Clear any old session data immediately
    localStorage.clear();

    try {
      // ✅ Use raw axios to prevent global interceptors from refreshing the page on 401 (Wrong Password)
      const response = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, {
        email,
        password_hash: password,
      });

      const data = response.data;
      console.log("Login success:", data);

      // 2. Validate Response
      if (data.token && data.user) {
        // 3. Store Data
        localStorage.setItem("token", data.token);
        
        const userId = data.user.id || data.user.user_id; // Handle both naming conventions
        const userRoleString = data.user.role_id ? getRoleString(data.user.role_id) : null;
        
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userId", String(userId));
        
        if (userRoleString) {
            localStorage.setItem("userRole", userRoleString);
        }

        // Handle Role-Specific IDs
        if (data.user.instructor_id) {
          localStorage.setItem("instructorId", String(data.user.instructor_id));
        }
        if (data.user.dietician_id) {
            localStorage.setItem("dieticianId", String(data.user.dietician_id));
        }

        const isProfileComplete = data.user.profile_complete ?? false; 

        if (!userRoleString) {
          alert("Unknown user role received from the server. Please contact support.");
          setIsLoading(false);
          return;
        }

        // 4. Navigation Logic
        
        // A. Admin always goes to dashboard
        if (userRoleString === "Admin") {
          navigate("/admin");
          return;
        }

        // B. Check Profile Completion
        if (!isProfileComplete) {
          navigate("/complete-profile", {
            state: {
              role: userRoleString, 
              userId: userId, 
            },
          });
          return;
        }

        // C. Standard Redirects
        switch (userRoleString) {
          case "Client":
            navigate("/client");
            break;
          case "Instructor":
            navigate("/instructor");
            break;
          case "Dietician":
            navigate("/dietician");
            break;
          default:
            navigate("/"); 
            break;
        }
      } else {
        alert("Login successful but user details were missing.");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Server responded with error (e.g., 401 Invalid Credentials)
        alert(error.response.data?.message || "Invalid email or password.");
      } else if (error.request) {
        // Request made but no response
        alert("Network error. Please check your internet connection.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
        setIsLoading(false);
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
                  tabIndex={-1} // Prevent tabbing to this button
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

            <button type="submit" className="btn-primary" disabled={isLoading}>
              <span>{isLoading ? "Signing In..." : "Sign In"}</span>
              {!isLoading && <i className="fas fa-arrow-right"></i>}
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
                <Link to="/signUp">SignUp Here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;