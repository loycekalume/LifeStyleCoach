import React, { useState, useEffect } from "react";
import { 
  FaTimes, FaUser,  FaWeight, FaRulerVertical, 
  FaBullseye, FaSave, FaMapMarkerAlt, FaVenusMars, 
  FaAllergies, FaFileMedical, FaDollarSign 
} from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import "../../styles/clientProfile.css";

interface ClientProfileModalProps {
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

// Utility to format string input for Postgres Array
const formatForDb = (input: string): string => {
  if (!input) return "{}";
  const elements = input.split(',').map(e => `"${e.trim()}"`).filter(e => e.length > 0);
  return `{${elements.join(',')}}`;
};

// Utility to format DB Array to Input String
const formatForInput = (input: string[] | string | null): string => {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(", ");
  // Handle case where it might come as "{a,b}" string from raw query
  if (typeof input === 'string' && input.startsWith('{')) {
      return input.replace(/[{}""]/g, '').split(',').join(', ');
  }
  return input;
};

export default function ClientProfileModal({ onClose, onUpdateSuccess }: ClientProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    goal: "", 
    gender: "",
    allergies: "",
    health_conditions: "",
    budget: "",
    location: ""
  });

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await axiosInstance.get(`/client/${userId}`);
        const client = res.data;

        // 🔍 DEBUG: Check this in your browser console (F12)
        console.log("Fetched Client Data:", client);

        setFormData({
          name: client.name || "",
          email: client.email || "",
          
          // Numbers need to be converted to strings for inputs to handle "0" correctly
          age: client.age ? String(client.age) : "",
          weight: client.weight ? String(client.weight) : "",
          height: client.height ? String(client.height) : "",
          
          // ✅ Map DB column 'weight_goal' to State 'goal'
          goal: client.weight_goal || "", 
          
          // Strings (Trim to ensure dropdowns match)
          gender: client.gender ? client.gender.trim() : "",
          budget: client.budget ? client.budget.trim() : "",
          location: client.location || "",

          // Arrays
          allergies: formatForInput(client.allergies),
          health_conditions: formatForInput(client.health_conditions),
        });
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      
      const payload = {
        ...formData,
        allergies: formatForDb(formData.allergies),
        health_conditions: formatForDb(formData.health_conditions),
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height)
      };

      await axiosInstance.put(`/client/${userId}`, payload);
      
      localStorage.setItem("userName", formData.name);
      
      alert("Profile updated successfully!");
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null; 

  return (
    <div className="modal-overlayp">
      <div className="modal-contentp profile-modalp">
        <div className="modal-headerp">
          <h2>Edit Profile</h2>
          <button className="close-btnp" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="profile-formp">
          
          {/* Section 1: Identity */}
          <div className="form-sectionp">
            <h3>Personal Info</h3>
            <div className="input-groupp">
              <FaUser className="input-iconp" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            </div>
            
            <div className="row">
                <div className="input-groupp">
                    <FaVenusMars className="input-iconp" />
                    {/* ✅ Values must match exactly what is in DB */}
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="input-groupp">
                    <label style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'0.9rem', fontWeight:'bold'}}>Age:</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} style={{paddingLeft:'50px'}} />
                </div>
            </div>
          </div>

          {/* Section 2: Metrics */}
          <div className="form-sectionp">
            <h3>Body & Fitness</h3>
            <div className="row">
              <div className="input-groupp">
                <FaWeight className="input-iconp" />
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" step="0.1" />
              </div>
              <div className="input-groupp">
                <FaRulerVertical className="input-iconp" />
                <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" />
              </div>
            </div>
            
            <div className="input-groupp">
              <FaBullseye className="input-iconp" />
              <select name="goal" value={formData.goal} onChange={handleChange}>
                <option value="">Select Goal</option>
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Muscle</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
          </div>

          {/* Section 3: Details */}
          <div className="form-sectionp">
            <h3>Health & Details</h3>
            
            <div className="input-groupp">
                <FaAllergies className="input-iconp" />
                <input 
                    type="text" 
                    name="allergies" 
                    value={formData.allergies} 
                    onChange={handleChange} 
                    placeholder="Allergies (comma separated)" 
                />
            </div>

            <div className="input-groupp">
                <FaFileMedical className="input-iconp" />
                <input 
                    type="text" 
                    name="health_conditions" 
                    value={formData.health_conditions} 
                    onChange={handleChange} 
                    placeholder="Health Conditions (comma separated)" 
                />
            </div>

            <div className="row">
                <div className="input-groupp">
                    <FaMapMarkerAlt className="input-iconp" />
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City/Location" />
                </div>
                <div className="input-groupp">
                    <FaDollarSign className="input-iconp" />
                    {/* ✅ Values must match exactly what is in DB */}
                    <select name="budget" value={formData.budget} onChange={handleChange}>
                        <option value="">Budget</option>
                        <option value="Low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="modal-actionsp">
            <button type="button" className="btn-cancelp" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-savep" disabled={saving}>
              {saving ? <div className="spinner-small"></div> : <><FaSave /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}