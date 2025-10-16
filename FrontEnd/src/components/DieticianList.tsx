import { useState, useEffect } from "react";
import { getDieticians } from "../Services/dieticianService";
import type { Dietician } from "../Services/dieticianService";
import "../styles/Dietician.css"

export default function DieticianList() {
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        const data = await getDieticians();
        setDieticians(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDieticians();
  }, []); // Runs once on mount

  if (loading) return <p>Loading dieticians...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
  
  <div style={{ padding: "20px" }}>
    <h2 style={{ color: "#007bff", marginBottom: "15px" }}>Available Dieticians</h2>
    <div
      style={{
        display: "flex",       // make it a flex container
        flexWrap: "wrap",      // allow cards to wrap to next line
        gap: "10px",           // spacing between cards
        listStyle: "none",     // optional since we no longer use <ul>
        padding: 0,
      }}
    >
      {dieticians.map((dietician) => (
        <div
          key={dietician.dietician_id}
          style={{
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center",
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            flex: "1 1 250px",    // grow, shrink, base width 250px
            minWidth: "200px",    // optional: ensures card doesn't shrink too much
            minHeight:"300px"
          }}
        >
          <strong>{dietician.specialization || "General Practitioner"}</strong> <br />
          <small>
            {dietician.years_of_experience
              ? `${dietician.years_of_experience} years experience`
              : "Experience not listed"}
          </small>
          <p style={{ margin: "5px 0 0 0", color: "#555" }}>
            {dietician.clinic_name || "No clinic info"}
          </p>
         <button style={{
          padding:"10px",
          backgroundColor:"#319795",
          border:"2px solid black",
          borderRadius:"10px"
         }}>Contact me</button>
        </div>
      ))}
    </div>
  </div>
);

  
}
