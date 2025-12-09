
import ClientCard from "./clientsCard";
import type  { Client } from "./clientsCard"
export default function ClientList() {
  const clients: Client[] = [
    {
      id: 1,
      name: "Emily Johnson",
      age: 29,
      condition: "Pre-Diabetic",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      name: "Michael Smith",
      age: 42,
      condition: "Hypertension",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      name: "Aisha Mwangi",
      age: 33,
      condition: "Weight Management",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
    },
  ];

  return (
    <section className="clients-section">
      <h2 className="section-title">Your Clients</h2>

      <div className="client-grid">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </section>
  );
}
