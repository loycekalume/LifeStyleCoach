// src/components/admin/Topbar.tsx
import React, { useEffect, useState } from "react";

const Topbar: React.FC = () => {
  const [datetime, setDatetime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setDatetime(now.toLocaleString("en-US", opts));
    };
    updateDateTime();
    const id = setInterval(updateDateTime, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <div className="welcome-section1">
        <h2>Welcome back, <span>Admin</span> 👋</h2>
        <p>{datetime}</p>
      </div>

      <div className="profile">
        <i className="fas fa-bell" />
        <img className="avatar" src="https://i.pravatar.cc/40?img=3" alt="admin" />
        <span>Admin</span>
      </div>
    </header>
  );
};

export default Topbar;
