import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faCalendarAlt,
  faMapMarkerAlt,
  faGlobe,
  faChalkboardTeacher,
  faFileContract,
  faAddressCard,
  faDollarSign,
  faPlus,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/instructorProfile.css"; 

// --- Interface Definitions ---

interface ProfileState {
  role: string;
  userId: number | null; 
}

interface PricingOption {
  temp_id: number;
  price: string; 
  session_type: string;
  unit: string;
}

interface InstructorProfileData {
  user_id: number | null;
  specialization: string;
  website_url: string;
  certifications: string;
  years_of_experience: string;
 profile_title: string;
  coaching_mode: "onsite" | "remote" | "both" | "";
  bio: string;
  available_locations: string;
}

// --- Step Props Interface ---
interface StepProps {
  formData: InstructorProfileData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  nextStep: (e: React.FormEvent) => void;
  prevStep: () => void;
  // Step 4 specific props
  pricingOptions: PricingOption[];
  newPricing: Omit<PricingOption, 'temp_id'>;
  handlePricingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  addPricingOption: (e: React.FormEvent) => void;
  deletePricingOption: (temp_id: number) => void;
  handleSubmit: (e: React.FormEvent) => void; 
  isLoading: boolean;
  userId: number | null;
}

// ----------------------------------------------------------------------
// --- Step Components (Moved outside for DOM stability) ---
// ----------------------------------------------------------------------

const Step1: React.FC<StepProps> = ({ formData, handleChange, nextStep }) => (
    <>
      <h3 className="step-title">1. Professional Summary</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
        <input
          type="text"
          name="profile_title"
          placeholder="Profile Headline (e.g., Certified Strength Coach)"
          value={formData.profile_title}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faTrophy} className="input-icon" />
        <input
          type="text"
          name="specialization"
          placeholder="Primary Specialization (e.g., Kettlebells, Yoga, Marathon Training)"
          value={formData.specialization}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
        <input
          type="number"
          name="years_of_experience"
          placeholder="Years of Experience"
          value={formData.years_of_experience}
          onChange={handleChange}
          required
          min="0"
          max="50"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Availability & Bio
        </button>
      </div>
    </>
);

const Step2: React.FC<StepProps> = ({ formData, handleChange, nextStep, prevStep }) => (
    <>
      <h3 className="step-title">2. Availability & Bio</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faChalkboardTeacher} className="input-icon" />
        <select
          name="coaching_mode"
          value={formData.coaching_mode}
          onChange={handleChange}
          required
        >
          <option value="">Select Coaching Mode</option>
          {/* ✅ FIX: Changed option values to match PostgreSQL check constraint */}
          <option value="remote">Online Only</option>
          <option value="onsite">In-person Only</option>
          <option value="both">Hybrid (Online & In-person)</option>
        </select>
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
        <input
          type="text"
          name="available_locations"
          placeholder="Available Locations (e.g., NYC, Online via Zoom)"
          value={formData.available_locations}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <textarea
          name="bio"
          placeholder="Write a brief, compelling bio (150-500 characters)"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          required
          maxLength={500}
        ></textarea>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Certifications & Links
        </button>
      </div>
    </>
);

const Step3: React.FC<StepProps> = ({ formData, handleChange, nextStep, prevStep }) => (
    <>
      <h3 className="step-title">3. Certifications & Links</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faFileContract} className="input-icon" />
        <textarea
          name="certifications"
          placeholder="List all professional certifications, separated by commas (e.g., NASM-CPT, Precision Nutrition L1)"
          rows={3}
          value={formData.certifications}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faGlobe} className="input-icon" />
        <input
          type="url"
          name="website_url"
          placeholder="Personal/Business Website URL (Optional)"
          value={formData.website_url}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Pricing & Services
        </button>
      </div>
    </>
);

const Step4: React.FC<StepProps> = ({ 
  pricingOptions, 
  newPricing, 
  handlePricingChange, 
  addPricingOption, 
  deletePricingOption, 
 
  isLoading,
  userId,
  prevStep,
}) => (
    <>
      <h3 className="step-title">4. Pricing & Services</h3>
      <p className="step-subtitle">Define your session types and pricing options.</p>

      <div className="pricing-form">
        <div className="form-group">
          <input
            type="text"
            name="session_type"
            placeholder="Session Type (e.g., 1-on-1, 10-Session Package)"
            value={newPricing.session_type}
            onChange={handlePricingChange}
            required
          />
        </div>
        <div className="form-group-inline">
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faDollarSign} className="input-icon" />
            <input
              type="number"
              name="price"
              placeholder="Price (e.g., 75.00)"
              value={newPricing.price}
              onChange={handlePricingChange}
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <select
            name="unit"
            value={newPricing.unit}
            onChange={handlePricingChange}
            required
          >
            <option value="">Select Unit</option>
            <option value="hour">/hour</option>
            <option value="session">/session</option>
            <option value="package">/package</option>
            <option value="month">/month</option>
          </select>
        </div>
        <button type="button" className="btn-add-pricing" onClick={addPricingOption}>
          <FontAwesomeIcon icon={faPlus} /> Add Option
        </button>
      </div>

      {/* Pricing List */}
      <div className="pricing-list">
        {pricingOptions.length === 0 ? (
          <p className="no-pricing">No pricing options added yet.</p>
        ) : (
          pricingOptions.map((p) => (
            <div key={p.temp_id} className="pricing-item">
              <span className="pricing-details">
                <strong>{p.session_type}</strong> - ${Number(p.price).toFixed(2)}{p.unit ? `/${p.unit}` : ''}
              </span>
              <button
                type="button"
                className="btn-delete-pricing"
                onClick={() => deletePricingOption(p.temp_id)}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button
          type="submit" 
          className="btn-primary"
          disabled={isLoading || !userId || pricingOptions.length === 0}
        >
          {isLoading ? "Submitting..." : "Complete Profile"}
        </button>
      </div>
    </>
);


// ----------------------------------------------------------------------
// --- Main Component ---
// ----------------------------------------------------------------------

const InstructorProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { role, userId } = (location.state as ProfileState) || {
    role: "",
    userId: null, 
  };
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<InstructorProfileData>({
    user_id: userId,
    specialization: "",
    website_url: "",
    certifications: "",
    years_of_experience: "",
    profile_title: "",
    // Default initial value must also be a valid DB value
    coaching_mode: "", 
    bio: "",
    available_locations: "",
  });
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [newPricing, setNewPricing] = useState<Omit<PricingOption, 'temp_id'>>({
    session_type: "",
    price: "",
    unit: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || role !== "Instructor") {
      console.error("Missing user details or incorrect role. Redirecting to login.");
      navigate("/login"); 
    }
    setFormData(prev => ({ ...prev, user_id: userId }));
  }, [userId, role, navigate]);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setError(null);
    
    // Store raw string value for all fields to maintain focus and stability
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePricingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Store raw string value for all fields to maintain focus and stability
    setNewPricing((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addPricingOption = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (!newPricing.session_type || newPricing.price === "" || !newPricing.unit) {
      setError("Please fill in all pricing fields.");
      return;
    }
    
    const priceValue = parseFloat(newPricing.price as string);
    if (isNaN(priceValue)) {
      setError("Price must be a valid number.");
      return;
    }

    const newOption: PricingOption = {
      ...newPricing,
      temp_id: Date.now(),
      price: newPricing.price, 
    };
    setPricingOptions((prev) => [...prev, newOption]);
    setNewPricing({ session_type: "", price: "", unit: "" });
    setError(null);
  };

  const deletePricingOption = (temp_id: number) => {
    setPricingOptions((prev) => prev.filter((p) => p.temp_id !== temp_id));
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (step === 1 && (!formData.profile_title || !formData.specialization || formData.years_of_experience === "")) {
      setError("Please fill in all required fields for this step.");
      return;
    }
    if (step === 2 && (!formData.coaching_mode || !formData.bio || !formData.available_locations)) {
        setError("Please fill in all required fields for this step.");
        return;
    }
    if (step === 3 && !formData.certifications) {
        setError("Please enter your certifications.");
        return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id) {
        setError("User ID is missing. Please log in again.");
        return;
    }
    if (pricingOptions.length === 0) {
        setError("Please add at least one pricing option to your profile.");
        return;
    }

    // Final numeric validation before submission
    if (isNaN(Number(formData.years_of_experience))) {
        setError("Years of Experience must be a valid number.");
        return;
    }

    setIsLoading(true);
    setError(null);
    const instructorEndpoint = "http://localhost:3000/instructors"; 
    const pricingEndpoint = "http://localhost:3000/instructors/pricing"; 

    try {
      // --- Data Formatting for PostgreSQL Array Fix ---
      const formatArray = (input: string): string => {
        if (!input) return "{}";
        // 1. Split by comma (e.g., "Weight Loss, Yoga" -> ["Weight Loss", " Yoga"])
        // 2. Map each element: trim whitespace and wrap in double quotes (e.g., " \"Weight Loss\" ")
        // 3. Filter out empty strings from the map (length > 2 because it must contain at least "")
        // 4. Join with commas and wrap the whole thing in curly braces.
        const elements = input.split(',').map(e => `"${e.trim()}"`).filter(e => e.length > 2);
        return `{${elements.join(',')}}`;
      };
      
      const instructorPayload = {
        user_id: formData.user_id,
        website_url: formData.website_url,
        years_of_experience: Number(formData.years_of_experience),
        profile_title: formData.profile_title,
        coaching_mode: formData.coaching_mode,
        bio: formData.bio,
        
        // APPLY ARRAY FORMATTING
        specialization: formatArray(formData.specialization), 
        certifications: formatArray(formData.certifications),
        available_locations: formatArray(formData.available_locations), 
      };

      // 1. Submit Instructor Profile Data
      const instructorRes = await axios.post(instructorEndpoint, instructorPayload);
      const instructor_id = instructorRes.data.instructor.instructor_id; 

      // 2. Submit Pricing Options
      if (instructor_id) {
        const pricingPromises = pricingOptions.map((p) => 
          axios.post(`${pricingEndpoint}`, {
            instructor_id,
            session_type: p.session_type,
            price: parseFloat(p.price), // Convert price string to number for backend
            unit: p.unit,
          })
        );
        await Promise.all(pricingPromises);
      }
       localStorage.setItem("instructorId", String(instructor_id));
      localStorage.setItem("profileComplete", "true");
      alert("Instructor profile and pricing saved successfully!");
      navigate("/instructor"); 

    } catch (err: any) {
      console.error("Error adding instructor:", err); // Log the full error here
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepProps: StepProps = {
    formData,
    handleChange,
    nextStep,
    prevStep,
    pricingOptions,
    newPricing,
    handlePricingChange,
    addPricingOption,
    deletePricingOption,
    handleSubmit,
    isLoading,
    userId: formData.user_id,
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 {...stepProps} />;
      case 2:
        return <Step2 {...stepProps} />;
      case 3:
        return <Step3 {...stepProps} />;
      case 4:
        return <Step4 {...stepProps} />;
      default:
        return <div>Something went wrong.</div>;
    }
  };

  return (
    <div className="wizard-container">
      {/* The main form element now handles all submissions */}
      <form onSubmit={step === 4 ? handleSubmit : nextStep} className="wizard-form">
        <h2 className="wizard-title">Instructor Profile Setup</h2>
        <div className="step-indicator">
          <span className={`step ${step === 1 ? "active" : ""}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
          <span className={`step ${step === 3 ? "active" : ""}`}>3</span>
          <span className={`step ${step === 4 ? "active" : ""}`}>4</span>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="wizard-content">
          {renderStep()}
        </div>
      </form>
    </div>
  );
};

export default InstructorProfileWizard;
