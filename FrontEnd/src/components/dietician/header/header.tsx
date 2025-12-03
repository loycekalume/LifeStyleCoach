import Logo from "./logo";
import ProfileDropdown from "./profileDropdown";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">

          <div className="header-left">
            <Logo />
            <h1>Dietician Dashboard</h1>
          </div>

          <div className="header-actions">
            <button className="btn btn-outline1">
              <i className="fas fa-plus"></i> New Meal Plan
            </button>

            <button className="btn btn-outline1">
              <i className="fas fa-calendar-plus"></i> Schedule Consultation
            </button>

            <ProfileDropdown />
          </div>

        </div>
      </div>
    </header>
  );
}
