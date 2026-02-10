import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/Login.css";

const ROLE_MAP: { [key: number]: "Client" | "Instructor" | "Dietician" | "Admin" } = {
  3: "Instructor",
  4: "Dietician",
  5: "Client", 
  1: "Admin",
};

interface LoginResponse {
  token?: string; 
  message?: string;
  user?: {
    id: number;
    user_id?: number;
    email: string;
    name: string;
    role_id: number; 
    profile_complete: boolean;
    instructor_id?: number; 
    dietician_id?: number;
  };
}

const getRoleString = (roleId: number): "Client" | "Instructor" | "Dietician" | "Admin" | null => {
  return ROLE_MAP[roleId] || null;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // Clear any old session data
    localStorage.clear();

    try {
      // ✅ Use axiosInstance with withCredentials to receive cookies
      const response = await axiosInstance.post<LoginResponse>("/auth/login", {
        email,
        password_hash: password,
      });

      const data = response.data;
      console.log("Login success:", data);

      // ✅ DON'T store token - it's in httpOnly cookie now
      // Validate Response
      if (data.user) {
        const userId = data.user.id || data.user.user_id;
        const userRoleString = data.user.role_id ? getRoleString(data.user.role_id) : null;
        
        // ✅ Only store non-sensitive user info
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

        // Navigation Logic
        if (userRoleString === "Admin") {
          navigate("/admin");
          return;
        }

        if (!isProfileComplete) {
          navigate("/complete-profile", {
            state: {
              role: userRoleString, 
              userId: userId, 
            },
          });
          return;
        }

        // Standard Redirects
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
        alert(error.response.data?.message || "Invalid email or password.");
      } else if (error.request) {
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
            <div className="form-groupl">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope input-iconl"></i>
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

            <div className="form-groupl">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-iconl"></i>
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
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              <span>{isLoading ? "Signing In..." : "Sign In"}</span>
              {!isLoading && <i className="fas fa-arrow-right"></i>}
            </button>

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