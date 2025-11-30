import React, { useState } from "react";

interface NavItem {
  icon: string;
  label: string;
}

const MobileNav: React.FC = () => {
  const [active, setActive] = useState<string>("Home");

  const items: NavItem[] = [
    { icon: "fa-home", label: "Home" },
    { icon: "fa-dumbbell", label: "Workouts" },
    { icon: "fa-utensils", label: "Nutrition" },
    { icon: "fa-calendar", label: "Schedule" },
    { icon: "fa-user", label: "Profile" },
  ];

  return (
    <nav className="mobile-nav">
      {items.map((item) => (
        <a
          key={item.label}
          href="#"
          className={`mobile-nav-item ${active === item.label ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setActive(item.label);
          }}
        >
          <i className={`fas ${item.icon}`} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default MobileNav;
