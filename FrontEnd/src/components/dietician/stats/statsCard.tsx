

interface StatCardProps {
  iconClass: string;
  value: number | string;
  label: string;
  type: "clients" | "plans" | "consultations";
}

export default function StatCard({ iconClass, value, label, type }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type}`}>
        <i className={iconClass}></i>
      </div>

      <div className="stat-info">
        <div className="stat-number">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
