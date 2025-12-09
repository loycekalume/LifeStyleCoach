

export interface Client {
  id: number;
  name: string;
  age: number;
  condition: string;
  image: string;
}

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="client-card">
      <img src={client.image} alt={client.name} className="client-image" />

      <div className="client-info">
        <h3>{client.name}</h3>
        <p>Age: {client.age}</p>
        <p className="condition">{client.condition}</p>
      </div>

      <div className="client-actions">
        <button className="btn btn-view">
          <i className="fas fa-eye"></i> View Profile
        </button>

        <button className="btn btn-plan">
          <i className="fas fa-notes-medical"></i> Create Meal Plan
        </button>
      </div>
    </div>
  );
}
