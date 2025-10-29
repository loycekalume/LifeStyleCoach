import React, { useEffect, useState } from "react";
import { getClients, toggleUserStatus } from "../../Services/adminService";
import "../../styles/adminTable.css";

interface Client {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const ClientsTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getClients(token);
        setClients(data);
        setFilteredClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const term = value.toLowerCase();
    if (!term.trim()) {
      setFilteredClients(clients);
      return;
    }
    setFilteredClients(
      clients.filter((c) => (c.name || "").toLowerCase().includes(term))
    );
  };

  const handleToggleStatus = async (user_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { active } = await toggleUserStatus(token, user_id);

      setClients((prev) =>
        prev.map((c) => (c.user_id === user_id ? { ...c, active } : c))
      );
      setFilteredClients((prev) =>
        prev.map((c) => (c.user_id === user_id ? { ...c, active } : c))
      );
    } catch (err) {
      console.error("Error toggling user:", err);
    }
  };

  const handleBack = () => {
    window.location.href = "/admin";
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Client Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <button onClick={handleBack} className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <tr key={c.user_id}>
                  <td>{c.name}</td>
                  <td>
                    <span className="joined-date">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${c.active ? "success" : "danger"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions">
                    <a
                      href={`/admin/user/${c.user_id}`}
                      className="action view"
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i> View
                    </a>

                    <button
                      className={`btn ${
                        c.active ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(c.user_id)}
                    >
                      <i
                        className={`fas ${
                          c.active ? "fa-user-slash" : "fa-user-check"
                        }`}
                      ></i>{" "}
                      {c.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-data">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
