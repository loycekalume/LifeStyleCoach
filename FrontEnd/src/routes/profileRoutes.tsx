import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InstructorProfileWizard from '../profileWizards/instructorWizard'; // Assuming this is the path
import ClientProfileWizard from '../profileWizards/clientWizard'; // Assuming this is the path

const ProfileLoader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract role and userId from the state passed by the login component
  const { role, userId } = (location.state as { role: string; userId: number | null }) || {
    role: null,
    userId: null,
  };
  
  // Basic validation
  if (!role || !userId) {
    // This happens if the user navigates directly or state is lost
    console.error("ProfileLoader: Missing role or user ID in state. Redirecting.");
    return <p>Loading...</p>; // Or redirect to login immediately
  }
  
  // Conditionally render the correct wizard
  switch (role) {
    case 'Instructor':
      return <InstructorProfileWizard />;
      
    case 'Client':
      return <ClientProfileWizard />;

    case 'Dietician':
      // You will implement this wizard later
      return <p>Dietician Profile Wizard Coming Soon...</p>; 

    default:
      // Fallback for roles that don't need a wizard, but were incorrectly sent here
      return <p>Unsupported role. Redirecting to dashboard...</p>;
  }
};

export default ProfileLoader;
