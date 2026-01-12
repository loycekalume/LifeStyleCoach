import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRulerVertical,
  faWeight,
  faChild,
  faBullseye,
  faVenusMars,
  faAllergies,
  faDollarSign,
  faMapMarkerAlt,
  faDumbbell, // 👈 NEW: Icon for fitness level
} from "@fortawesome/free-solid-svg-icons";
import "../styles/clientWizard.css"; 

interface ProfileState {
  role: string;
  userId: number | null;
}

// 👇 UPDATE 1: Add fitness_level to the Interface
interface ClientProfileData {
  user_id: number | null;
  age: string;
  weight: string;
  height: string;
  goal: string;
  fitness_level: string; // 👈 NEW FIELD
  gender: string;
  allergies: string;
  budget: string;
  location: string;
}

const formatArray = (input: string | null): string => {
  if (!input) return "{}";
  const elements = input.split(',').map(e => `"${e.trim()}"`).filter(e => e.length > 2);
  return `{${elements.join(',')}}`;
};

const ClientProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId } = (location.state as ProfileState) || {
    role: "",
    userId: null,
  };

  const [step, setStep] = useState(1);
  
  // 👇 UPDATE 2: Initialize the new field in State
  const [formData, setFormData] = useState<ClientProfileData>({
    user_id: userId,
    age: "",
    weight: "",
    height: "",
    goal: "",
    fitness_level: "", // 👈 Initialize as empty
    gender: "",
    allergies: "",
    budget: "",
    location: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || role !== "Client") {
      console.error("Client Wizard: Missing user details or incorrect role.");
      navigate("/login");
    }
    setFormData((prev) => ({ ...prev, user_id: userId }));
  }, [userId, role, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.age || !formData.weight || !formData.height || !formData.gender) {
        setError("Please fill all required health metrics.");
        return false;
      }
      if (isNaN(parseFloat(formData.age)) || isNaN(parseFloat(formData.weight)) || isNaN(parseFloat(formData.height))) {
        setError("Age, Weight, and Height must be valid numbers.");
        return false;
      }
    }
    if (currentStep === 2) {
      // 👇 UPDATE 3: Validate that Fitness Level is selected
      if (!formData.goal || !formData.budget || !formData.location || !formData.fitness_level) {
        setError("Please set your goal, fitness level, budget, and location.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    if (!formData.user_id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 👇 UPDATE 4: Include fitness_level in the payload sent to Backend
      const payload = {
        user_id: formData.user_id,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        goal: formData.goal,
        fitness_level: formData.fitness_level, // 👈 SENDING IT HERE
        gender: formData.gender,
        allergies: formatArray(formData.allergies), 
        budget: formData.budget, 
        location: formData.location,
      };

      const res = await axios.post("http://localhost:3000/client", payload); 
      
      if (res.data.client && res.data.client.client_id) {
          localStorage.setItem("clientId", String(res.data.client.client_id));
      }
      
      alert(res.data.message);
      navigate("/client");
    } catch (err: any) {
      console.error("Profile submission error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please ensure your backend is running and data is valid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h3 className="step-title">1. Health Metrics (Required)</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faChild} className="input-icon" />
        <input
          type="number"
          name="age"
          placeholder="Age (years) *"
          value={formData.age}
          onChange={handleChange}
          required
          min="16"
        />
      </div>
      <div className="form-group half-width">
        <FontAwesomeIcon icon={faWeight} className="input-icon" />
        <input
          type="number"
          name="weight"
          placeholder="Current Weight (kg) *"
          value={formData.weight}
          onChange={handleChange}
          required
          step="0.1"
          min="20"
        />
      </div>
      <div className="form-group half-width">
        <FontAwesomeIcon icon={faRulerVertical} className="input-icon" />
        <input
          type="number"
          name="height"
          placeholder="Height (cm) *"
          value={formData.height}
          onChange={handleChange}
          required
          min="50"
        />
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faVenusMars} className="input-icon" />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender *</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other / Prefer not to say</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Goals & Lifestyle
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="step-title">2. Goals & Lifestyle</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faBullseye} className="input-icon" />
        <select
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
        >
          <option value="">Select Primary Fitness Goal *</option>
          <option value="lose">Lose Weight</option>
          <option value="gain">Gain Muscle</option>
          <option value="maintain">Maintain Weight / Wellness</option>
        </select>
      </div>

      {/* 👇 UPDATE 5: New Fitness Level Dropdown */}
      <div className="form-group">
        <FontAwesomeIcon icon={faDumbbell} className="input-icon" />
        <select
          name="fitness_level"
          value={formData.fitness_level}
          onChange={handleChange}
          required
          style={{ borderLeft: "5px solid #007bff" }} // Optional visual highlight
        >
          <option value="">Select Your Experience Level *</option>
          <option value="beginner">Beginner (New to fitness)</option>
          <option value="intermediate">Intermediate (Consistent training)</option>
          <option value="advanced">Advanced (High intensity / Athlete)</option>
        </select>
      </div>
      {/* ------------------------------------- */}

      <div className="form-group">
        <FontAwesomeIcon icon={faAllergies} className="input-icon" />
        <input
          type="text"
          name="allergies"
          placeholder="Food Allergies (Optional)"
          value={formData.allergies}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group half-width">
        <FontAwesomeIcon icon={faDollarSign} className="input-icon" />
        <select
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
        >
          <option value="">Select Monthly Budget *</option>
          <option value="Low">Low (Under $100)</option>
          <option value="medium">Medium ($100 - $300)</option>
          <option value="high">High (Over $300)</option>
        </select>
      </div>

      <div className="form-group half-width">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
        <input
          type="text"
          name="location"
          placeholder="City / Time Zone *"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !formData.user_id}
        >
          {isLoading ? "Saving Profile..." : "Complete Client Profile"}
        </button>
      </div>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return <div>Profile Complete! Redirecting...</div>;
    }
  };

  return (
    <div className="wizard-container">
      <form onSubmit={step === 2 ? handleSubmit : nextStep} className="wizard-form">
        <h2 className="wizard-title">Client Profile Setup</h2>
        <div className="step-indicator">
          <span className={`step ${step === 1 ? "active" : ""}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="wizard-content">
          {renderStep()}
        </div>
      </form>
    </div>
  );
};

export default ClientProfileWizard;