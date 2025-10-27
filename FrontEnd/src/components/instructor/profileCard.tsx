import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for potential redirect if ID is missing

interface InstructorProfile {
  name?: string;
  profile_title?: string | null;
  years_of_experience?: number | null;
  available_locations?: string[] | null;
  avatar_url?: string | null; // optional, in case you add avatar later
}

const ProfileCard: React.FC = () => {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🛑 FIX 1: State for dynamic instructor ID
  const [instructorId, setInstructorId] = useState<number | null>(null); 
  const navigate = useNavigate(); // Initialize useNavigate for potential redirects

  // Retrieve the ID from localStorage on component mount
  useEffect(() => {
    // ✅ FIX 2: Read the dedicated instructorId from localStorage
    const storedId = localStorage.getItem("instructorId"); 
    if (storedId) {
      setInstructorId(parseInt(storedId, 10));
    } else {
      // Optional: Redirect to login if a profile card is opened without a valid instructorId
      // console.error("Missing instructorId in localStorage. Redirecting...");
      // navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Only proceed if we have a valid ID
    if (instructorId === null) return;
    
    const fetchProfile = async () => {
      try {
        // ✅ FIX 3: Use dynamic instructorId in the fetch URL
        const res1 = await fetch(`http://localhost:3000/instructors/${instructorId}/profile`);
        if (res1.ok) {
          const json = await res1.json();
          setProfile((json && (json.profile ?? json)) || null);
          setLoading(false); // Set loading to false after successful fetch
          return;
        }

        // fallback (This logic seems redundant as it hits the same endpoint, 
        // but kept for structure while using the dynamic ID)
        const res2 = await fetch(`http://localhost:3000/instructors/${instructorId}/profile`);
        if (!res2.ok) throw new Error("Failed to fetch instructor profile");
        const json2 = await res2.json();
        setProfile((json2 && (json2.profile ?? json2)) || null);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [instructorId]); // Depend on instructorId to re-run when it is fetched

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) return <div className="card profile-card">Loading profile...</div>;
  if (error) return <div className="card profile-card">Error: {error}</div>;
  if (!profile) return <div className="card profile-card">No profile data found.</div>;

  const initials = getInitials(profile.name);

  const locations =
    Array.isArray(profile.available_locations) && profile.available_locations.length > 0
      ? profile.available_locations.join(", ")
      : "Location not set";

  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {/* If you later add avatar_url in DB, it will show; otherwise show initials fallback */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name ?? "Instructor avatar"} />
            ) : (
              <div className="avatar-fallback" aria-hidden>
                {initials || "?"}
              </div>
            )}

            {/* edit button (can be hidden if not editable) */}
            <button className="avatar-edit-btn" aria-label="Edit avatar">
              <i className="fas fa-camera"></i>
            </button>

            {/* verified badge - show always or conditionally when you add verification */}
            <div className="verified-badge">
              <i className="fas fa-check-circle"></i>
            </div>
        </div>
        </div>

        <h2 className="profile-name">{profile.name ?? "Unnamed Instructor"}</h2>
        <p className="profile-title">{profile.profile_title ?? "Instructor"}</p>

        <div className="profile-meta">
          <div className="meta-item">
            <i className="fas fa-map-marker-alt"></i> <span>{locations}</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-calendar"></i>{" "}
            <span>
              {profile.years_of_experience != null
                ? `${profile.years_of_experience} years exp.`
                : "Years of experience not set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
