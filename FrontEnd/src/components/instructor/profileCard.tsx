import React, { useEffect, useState } from "react";
import EditProfileModal from "./editProfileCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../utils/axiosInstance";

interface InstructorProfile {
  name?: string;
  profile_title?: string | null;
  years_of_experience?: number | null;
  available_locations?: string[] | null;
  avatar_url?: string | null;
}

const ProfileCard: React.FC = () => {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch instructorId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("instructorId");
    if (storedId) setInstructorId(parseInt(storedId, 10));
  }, []);

  
  useEffect(() => {
    if (instructorId === null) return;

    const fetchProfile = async () => {
      try {
       
        const res = await axiosInstance.get(`/instructors/${instructorId}/profile`);
        
        // Axios returns data directly in res.data
        setProfile(res.data.profile ?? res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [instructorId]);

  const handleSave = (responseData: any) => {
    // Handle both structures (nested profile or direct object)
    const profileData = responseData.profile ?? responseData;
    setProfile(profileData);
    toast.success("Profile updated successfully!");
  };

  const getAvatarUrl = (name?: string, avatar_url?: string | null) => {
    // If there's an uploaded avatar, use it
    if (avatar_url) return avatar_url;

    // Otherwise generate one using UI Avatars API
    const displayName = name || "Instructor";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=random&color=fff&size=128`;
  };

  if (loading) return <div className="card profile-card">Loading...</div>;
  if (error) return <div className="card profile-card">Error: {error}</div>;
  if (!profile) return <div className="card profile-card">No data found</div>;

  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <img
              src={getAvatarUrl(profile.name, profile.avatar_url)}
              alt={profile.name || "Instructor avatar"}
              className="avatar-img"
            />
          </div>
        </div>

        <button
          className="edit-icon"
          onClick={() => setIsEditing(true)}
          title="Edit profile"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <h2 className="profile-name">{profile.name}</h2>
      <p className="profile-title">{profile.profile_title ?? "Instructor"}</p>
      <div className="profile-meta">
        <p>
          <i className="fas fa-briefcase"></i>{" "}
          {profile.years_of_experience ?? "N/A"} years experience
        </p>
        <p>
          <i className="fas fa-map-marker-alt"></i>{" "}
          {profile.available_locations?.join(", ") || "No location set"}
        </p>
      </div>

      {instructorId && (
        <EditProfileModal
          instructorId={instructorId}
          profile={profile}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProfileCard;