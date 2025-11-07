import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "../Services/clientViewService";
import type { Client } from "../Services/clientViewService";
import ClientProfileModal from "./clientViewModal";
import "../styles/clientView.css";

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 6;

  // ✅ Get user role from localStorage
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  useEffect(() => {
    let filtered = clients;

    if (search.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (goalFilter) filtered = filtered.filter((c) => c.weight_goal === goalFilter);
    if (genderFilter) filtered = filtered.filter((c) => c.gender === genderFilter);

    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [search, goalFilter, genderFilter, clients]);

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Handle back navigation based on role
  const handleBackNavigation = () => {
    if (userRole === "Instructor") {
      navigate("/instructor");
    } else if (userRole === "Dietician") {
      navigate("/dietician");
    } else {
      navigate("/clientsView"); // fallback in case role is missing
    }
  };

  return (
    <div className="clients-page">
      {/* ✅ Dynamic Back Button */}
      <button className="back-btn" onClick={handleBackNavigation}>
        ← Back to Profile
      </button>

      <h1 className="page-title">Client Directory</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setGoalFilter(e.target.value)} defaultValue="">
          <option value="">Filter by Goal</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Muscle Gain">Muscle Gain</option>
          <option value="Fitness Maintenance">Fitness Maintenance</option>
        </select>

        <select onChange={(e) => setGenderFilter(e.target.value)} defaultValue="">
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="clients-grid">
        {currentClients.length > 0 ? (
          currentClients.map((client) => (
            <div key={client.user_id} className="client-card">
              <div className="client-header">
                <h3>{client.name}</h3>
                <p className="client-location">{client.location}</p>
              </div>
              <div className="client-info">
                <p><strong>Goal:</strong> {client.weight_goal}</p>
                <p><strong>Age:</strong> {client.age}</p>
                <p><strong>Gender:</strong> {client.gender}</p>
                <p><strong>Budget:</strong> ${client.budget}</p>
              </div>
              <div className="card-actions">
                <button className="btn-profile" onClick={() => setSelectedClient(client)}>
                  View Profile
                </button>
                <button
                  className="btn-contact"
                  onClick={() => window.open(`mailto:${client.email}`, "_blank")}
                >
                  Contact
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No clients found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            &gt;
          </button>
        </div>
      )}

      {selectedClient && (
        <ClientProfileModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};

export default ClientsPage;
