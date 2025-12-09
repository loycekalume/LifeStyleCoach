import Logo from "./logo";
import ProfileDropdown from "./profileDropdown";
import { useModal } from "./../../../contexts/modalContext"; 

export default function Header() {
  const { openMealPlanModal, openConsultationModal } = useModal(); 

  return (
    <header className="header1">
      <div className="container">
        <div className="header1-content">

          <div className="header1-left">
            <Logo />
            <h1>Dietician Dashboard</h1>
          </div>

          <div className="header1-actions">
            <button 
              className="btn btn-outline1"
              onClick={openMealPlanModal} 
            >
              <i className="fas fa-plus"></i> New Meal Plan
            </button>

            <button 
              className="btn btn-outline1"
              onClick={openConsultationModal}
            >
              <i className="fas fa-calendar-plus"></i> Schedule Consultation
            </button>

            <ProfileDropdown />
          </div>

        </div>
      </div>
    </header>
  );
}