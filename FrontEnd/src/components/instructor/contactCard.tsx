import React, { useEffect, useState } from "react";
import EditContactModal from "./editContactModal"; 
import axiosInstance from "../../utils/axiosInstance"; 

interface ContactInfo {
  name: string;
  email: string;
  contact: string;
  website_url: string;
  availability: string;
  coaching_mode: string; 
}

const ContactCard: React.FC<{ instructorId: number }> = ({ instructorId }) => {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        // ✅ Use axiosInstance.get()
        // No need to manually check res.ok or parse JSON
        const res = await axiosInstance.get(`/instructors/${instructorId}/contact`);
        
        setContact(res.data);
      } catch (err: any) {
        console.error("Error fetching contact info:", err);
        setError("Failed to load contact information");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) fetchContact();
  }, [instructorId]);

  const handleSave = (updatedData: ContactInfo) => {
    setContact(updatedData);
    setIsEditing(false);
  };

  if (loading) return <div className="card contact-card">Loading contact info...</div>;
  
  if (error || !contact) {
    return (
      <div className="card contact-card">
        <div className="card-header">
           <h3><i className="fas fa-user"></i> Contact & Availability</h3>
        </div>
        <div className="card-content">
           <p className="text-red-500">{error || "No contact info found"}</p>
        </div>
      </div>
    );
  }

  const coachingText =
    contact.coaching_mode === "onsite"
      ? "In-person sessions"
      : contact.coaching_mode === "remote"
      ? "Online sessions"
      : "In-person & Online sessions";

  return (
    <div className="card contact-card">
      <div className="card-header">
        <h3>
          <i className="fas fa-user"></i> Contact & Availability
        </h3>

        {/* 👇 Edit button */}
        <button 
          className="edit-icon" 
          onClick={() => setIsEditing(true)} 
          title="Edit contact info"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="card-content">
        <div className="contact-list">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>{contact.email}</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>{contact.contact}</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-globe"></i>
            <span>
              {contact.website_url ? (
                <a href={contact.website_url} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6', textDecoration: 'none'}}>
                  {contact.website_url}
                </a>
              ) : "Not provided"}
            </span>
          </div>
          <div className="contact-item">
            <i className="fas fa-clock"></i>
            <span>{contact.availability || "Not specified"}</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{coachingText}</span>
          </div>
        </div>
      </div>

      {/* 👇 Include the edit modal */}
      {isEditing && contact && (
        <EditContactModal
          instructorId={instructorId}
          contact={contact}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ContactCard;