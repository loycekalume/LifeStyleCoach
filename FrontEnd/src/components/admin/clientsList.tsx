import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "../../Services/adminService"; // ✅ Removed unused imports
import { toast } from "react-toastify";
import "../../styles/adminTable.css";

interface Client {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const ClientsTable: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        
        if (Array.isArray(data)) {
            setClients(data);
            setFilteredClients(data);
        } else {
            setClients([]);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
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

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Client Management</h2>
        
        <div className="header-actions">
          {/* Search Box */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Back Button */}
          <button onClick={() => navigate("/admin")} className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
            <p className="loading-text">Loading clients...</p>
        ) : (
            <table className="custom-table">
            <thead>
                <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Name</th>
                <th>Date Joined</th>
                </tr>
            </thead>

            <tbody>
                {filteredClients.length > 0 ? (
                filteredClients.map((c, index) => (
                    <tr key={c.user_id}>
                    {/* Numbering */}
                    <td>{index + 1}</td>
                    
                    {/* Name */}
                    <td>
                        <div className="user-info">
                            <span className="user-name">{c.name}</span>
                        </div>
                    </td>
                    
                    {/* Date Joined */}
                    <td>
                        <span className="joined-date">
                        {new Date(c.created_at).toLocaleDateString()}
                        </span>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={3} className="no-data">
                    No clients found
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default ClientsTable;