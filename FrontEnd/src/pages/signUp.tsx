import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance"; 
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faLeaf,
  faDumbbell,
  faPhone,
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../styles/signup.css";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "userType") {
      setSelectedRole(value);
    }

    if (name === "password") checkPasswordStrength(value);
  };

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) {
      setPasswordStrength("Weak");
    } else if (password.length < 10) {
      setPasswordStrength("Medium");
    } else {
      setPasswordStrength("Strong");
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.contact,
        password_hash: formData.password,
        role_id:
          formData.userType === "Client"
            ? 5
            : formData.userType === "Instructor"
            ? 3
            : formData.userType === "Dietician"
            ? 4
            : null,
      };

     
      const res = await axiosInstance.post("/auth/register", payload);
      
      alert(res.data.message);
      
     
      navigate("/login");
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">Create Account</h2>

          {/* First Name */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faPhone} className="input-icon" />
              <input
                type="tel"
                name="contact"
                placeholder="Phone Number"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {/* Password Strength */}
          {formData.password && (
            <p className={`strength ${passwordStrength.toLowerCase()}`}>
              Strength: {passwordStrength}
            </p>
          )}

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <h4>Select Role:</h4>
            <div className="radio-group">
              <label className="radio-container">
                <input
                  type="radio"
                  name="userType"
                  value="Client"
                  checked={formData.userType === "Client"}
                  onChange={handleChange}
                />
                <span className="radio-checkmark"></span>
                <span className="radio-content">
                  <FontAwesomeIcon icon={faUser} /> Client
                </span>
              </label>

              <label className="radio-container">
                <input
                  type="radio"
                  name="userType"
                  value="Instructor"
                  checked={formData.userType === "Instructor"}
                  onChange={handleChange}
                />
                <span className="radio-checkmark"></span>
                <span className="radio-content">
                  <FontAwesomeIcon icon={faDumbbell} /> Instructor
                </span>
              </label>

              <label className="radio-container">
                <input
                  type="radio"
                  name="userType"
                  value="Dietician"
                  checked={formData.userType === "Dietician"}
                  onChange={handleChange}
                />
                <span className="radio-checkmark"></span>
                <span className="radio-content">
                  <FontAwesomeIcon icon={faLeaf} /> Dietician
                </span>
              </label>
            </div>

            {selectedRole && (
              <p className="selected-role">
                You selected: <strong>{selectedRole}</strong>
              </p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary">
            Sign Up
          </button>

          {/* Link to Login */}
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;