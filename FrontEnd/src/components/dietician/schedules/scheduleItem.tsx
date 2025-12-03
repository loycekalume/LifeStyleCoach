

export interface Schedule {
  id: number;
  time: string;
  duration: string;
  clientName: string;
  clientImage: string;
  consultationType: string;
  notes: string;
  current?: boolean;
}

interface ScheduleItemProps {
  item: Schedule;
}

export default function ScheduleItem({ item }: ScheduleItemProps) {
  return (
    <div className={`schedule-item ${item.current ? "current" : ""}`}>
      <div className="schedule-time">
        <div className="time">{item.time}</div>
        <div className="duration">{item.duration}</div>
      </div>
      <div className="schedule-info">
        <div className="client-info">
          <img src={item.clientImage} alt={item.clientName} />
          <div className="client-details">
            <div className="client-name">{item.clientName}</div>
            <div className="consultation-type">{item.consultationType}</div>
          </div>
        </div>
        <div className="consultation-notes">
          <i className="fas fa-sticky-note"></i> {item.notes}
        </div>
      </div>
      <div className="schedule-actions">
        <button className={`btn ${item.current ? "btn-primary1" : "btn-outline1"} btn-sm`}>
          {item.current ? "Join Call" : "Prepare"}
        </button>
        <button className="btn btn-ghost btn-sm">
          <i className="fas fa-file-alt"></i>
        </button>
      </div>
    </div>
  );
}
