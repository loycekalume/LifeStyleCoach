import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; // ✅ Correctly imports your configured instance
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCalendarAlt,
  faClinicMedical,
  faMapMarkerAlt,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/instructorProfile.css"; 

interface ProfileState {
  role: string;
  userId: number | null;
}

interface DieticianProfileData {
  user_id: number | null;
  specialization: string; 
  certification: string;
  years_of_experience: string;
  clinic_name: string;
  clinic_address: string;
}

const DieticianProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId } = (location.state as ProfileState) || {
    role: "",
    userId: null,
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DieticianProfileData>({
    user_id: userId,
    specialization: "",
    certification: "",
    years_of_experience: "",
    clinic_name: "",
    clinic_address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic validation to ensure user came from registration/login
    if (!userId || role !== "Dietician") {
      console.error("Dietician Wizard: Missing user details or incorrect role.");
      // You might want to uncomment this for production safety:
      // navigate("/login");
    }
    setFormData((prev) => ({ ...prev, user_id: userId }));
  }, [userId, role, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      if (!formData.certification || !formData.years_of_experience) {
        setError("Please enter your certification and experience.");
        return false;
      }
      if (isNaN(parseInt(formData.years_of_experience))) {
        setError("Years of experience must be a valid number.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.specialization) {
        setError("Please specify your specialization(s).");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.clinic_name || !formData.clinic_address) {
        setError("Please provide your clinic or practice details.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    if (!formData.user_id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const specializationArray = formData.specialization
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const certificationArray = formData.certification
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const payload = {
        user_id: formData.user_id,
        certification: certificationArray,
        specialization: specializationArray,
        years_of_experience: parseInt(formData.years_of_experience, 10),
        clinic_name: formData.clinic_name,
        clinic_address: formData.clinic_address,
      };

      console.log("[WIZARD] Submitting payload:", payload);

      // ✅ Uses axiosInstance which automatically picks up VITE_API_URL
      const res = await axiosInstance.post("/dietician", payload);
      
      if (res.data.dietician && res.data.dietician.dietician_id) {
        localStorage.setItem("dieticianId", String(res.data.dietician.dietician_id));
      }
      
      alert(res.data.message);
      navigate("/dietician");
    } catch (err: any) {
      console.error("Profile submission error:", err);
      console.error("Response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please ensure your backend is running and data is valid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="step-title">1. Certification & Experience</h3>
            <div className="form-group">
              <FontAwesomeIcon icon={faCertificate} className="input-icon" />
              <input
                type="text"
                name="certification"
                placeholder="Main Certification (e.g., RDN, LD) *"
                value={formData.certification}
                onChange={handleChange}
                required
                maxLength={255}
                autoFocus 
              />
            </div>
            <div className="form-group">
              <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
              <input
                type="number"
                name="years_of_experience"
                placeholder="Years of Experience *"
                value={formData.years_of_experience}
                onChange={handleChange}
                required
                min="0"
                max="50"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next: Specialization
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="step-title">2. Areas of Expertise</h3>
            <div className="form-group">
              <FontAwesomeIcon icon={faGraduationCap} className="input-icon" />
              <textarea
                name="specialization"
                placeholder="Specialization (e.g., Weight Management, Diabetes, Pediatric Nutrition) - Separate with commas *"
                rows={4}
                value={formData.specialization}
                onChange={handleChange}
                required
                autoFocus
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next: Clinic Details
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="step-title">3. Clinic / Practice Details</h3>
            <div className="form-group">
              <FontAwesomeIcon icon={faClinicMedical} className="input-icon" />
              <input
                type="text"
                name="clinic_name"
                placeholder="Clinic Name / Practice Name *"
                value={formData.clinic_name}
                onChange={handleChange}
                required
                maxLength={255}
                autoFocus
              />
            </div>
            <div className="form-group">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
              <input
                type="text"
                name="clinic_address"
                placeholder="Clinic Address (City, State, or Remote Practice Name) *"
                value={formData.clinic_address}
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
                {isLoading ? "Saving Profile..." : "Complete Dietician Profile"}
              </button>
            </div>
          </>
        );
      default:
        return <div>Profile Complete! Redirecting...</div>;
    }
  };

  return (
    <div className="wizard-container">
      {/* Updated the onSubmit to handle types correctly */}
      <form onSubmit={(e) => step === 3 ? handleSubmit(e) : nextStep(e)} className="wizard-form">
        <h2 className="wizard-title">Dietician Profile Setup</h2>
        <div className="step-indicator">
          <span className={`step ${step === 1 ? "active" : ""}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
          <span className={`step ${step === 3 ? "active" : ""}`}>3</span>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="wizard-content">
          {renderContent()}
        </div>
      </form>
    </div>
  );
};

export default DieticianProfileWizard;