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
} from "@fortawesome/free-solid-svg-icons";
import "../styles/clientWizard.css"; 

interface ProfileState {
  role: string;
  userId: number | null;
}

// Client Profile Data Structure (all fields stored as strings for input stability)
interface ClientProfileData {
  user_id: number | null;
  age: string;
  weight: string;
  height: string;
  goal: string; // Maps to weight_goal in backend
  gender: string;
  allergies: string; // This field needs formatting
  budget: string; // Stored as string ('Low', 'medium', 'high')
  location: string;
}

// 🛑 FIX: PostgreSQL Array Formatting Utility
const formatArray = (input: string | null): string => {
  if (!input) return "{}";
  // Split by comma, trim whitespace, wrap elements in double quotes, and join into a PostgreSQL array literal.
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
  const [formData, setFormData] = useState<ClientProfileData>({
    user_id: userId,
    age: "",
    weight: "",
    height: "",
    goal: "",
    gender: "",
    allergies: "",
    budget: "", // Initial state is an empty string for the select
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation and Initialization on Load
  useEffect(() => {
    // Check if user ID is present AND if the role is correct for this wizard
    if (!userId || role !== "Client") {
      console.error("Client Wizard: Missing user details or incorrect role.");
      navigate("/login");
    }
    setFormData((prev) => ({ ...prev, user_id: userId }));
  }, [userId, role, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.age || !formData.weight || !formData.height || !formData.gender) {
        setError("Please fill all required health metrics.");
        return false;
      }
      // Simple numeric check using raw strings
      if (isNaN(parseFloat(formData.age)) || isNaN(parseFloat(formData.weight)) || isNaN(parseFloat(formData.height))) {
        setError("Age, Weight, and Height must be valid numbers.");
        return false;
      }
    }
    if (currentStep === 2) {
      // ✅ FIX: Budget must be one of the specified strings
      if (!formData.goal || !formData.budget || !formData.location) {
        setError("Please set your goal, budget, and location.");
        return false;
      }
      // Removed numeric budget check, as it's now a string select field
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
      const payload = {
        user_id: formData.user_id,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        goal: formData.goal, // weight_goal in backend
        gender: formData.gender,
        // ✅ FIX APPLIED: Format the allergies string into a PostgreSQL array literal
        allergies: formatArray(formData.allergies), 
        // ✅ FIX APPLIED: Send the budget string directly
        budget: formData.budget, 
        location: formData.location,
      };

      // Note: Assuming your backend endpoint is configured to handle the upsert and mark profile_complete=TRUE
      const res = await axios.post("http://localhost:3000/client", payload); 
      
      // Since the backend should return the client_id, we save it here
      if (res.data.client && res.data.client.client_id) {
          localStorage.setItem("clientId", String(res.data.client.client_id));
      }
      
      alert(res.data.message);
      // Profile complete, redirect to client dashboard
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

  // --- Step 1: Health Metrics ---
  const Step1: React.FC = () => (
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

  // --- Step 2: Goal & Lifestyle ---
  const Step2: React.FC = () => (
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
          {/* ✅ FIX: Map user-friendly labels to strict lowercase DB values */}
          <option value="lose">Lose Weight</option>
          <option value="gain">Gain Muscle</option>
          <option value="maintain">Maintain Weight / Wellness</option>
          <option value="maintain">Improve Endurance</option>
          <option value="maintain">Increase Mobility</option>
        </select>
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faAllergies} className="input-icon" />
        <input
          type="text"
          name="allergies"
          placeholder="Food Allergies/Dietary Restrictions (e.g., Peanuts, Gluten) (Optional)"
          value={formData.allergies}
          onChange={handleChange}
        />
      </div>
      
      {/* ✅ FIX: Changed from type="number" input to a SELECT based on DB constraint */}
      <div className="form-group half-width">
        <FontAwesomeIcon icon={faDollarSign} className="input-icon" />
        <select
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
        >
          <option value="">Select Monthly Budget *</option>
          {/* Values MUST match the DB CHECK constraint exactly */}
          <option value="Low">Low (Under $100)</option>
          <option value="medium">Medium ($100 - $300)</option>
          <option value="high">High (Over $300)</option>
        </select>
      </div>
      {/* End of Fix */}

      <div className="form-group half-width">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
        <input
          type="text"
          name="location"
          placeholder="City / Time Zone (e.g., London / EST) *"
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
        return <Step1 />;
      case 2:
        return <Step2 />;
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
