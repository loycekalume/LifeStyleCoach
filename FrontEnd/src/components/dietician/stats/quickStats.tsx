
import StatCard from "./statsCard";

export default function QuickStats() {
  return (
    <div className="quick-stats">

      <StatCard
        iconClass="fas fa-users"
        value={127}
        label="Active Clients"
        type="clients"
      />

      <StatCard
        iconClass="fas fa-clipboard-list"
        value={89}
        label="Meal Plans"
        type="plans"
      />

      <StatCard
        iconClass="fas fa-calendar-check"
        value={8}
        label="Today's Sessions"
        type="consultations"
      />

    </div>
  );
}
