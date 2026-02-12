import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Use navigate
import { getClients, toggleUserStatus } from "../../Services/adminService";
import { toast } from "react-toastify"; // Optional: Notification
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

  // ✅ Fetch Clients (No Token Needed)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        // axiosInstance handles credentials automatically
        const data = await getClients();
        
        if (Array.isArray(data)) {
            setClients(data);
            setFilteredClients(data);
        } else {
            console.error("API did not return an array", data);
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

  // ✅ Toggle Status (No Token Needed)
  const handleToggleStatus = async (user_id: number) => {
    try {
      await toggleUserStatus(user_id);
      
      toast.success("Client status updated");

      // Optimistic Update
      const updateState = (prev: Client[]) => 
        prev.map((c) => (c.user_id === user_id ? { ...c, active: !c.active } : c));

      setClients(updateState);
      setFilteredClients(updateState);
    } catch (err) {
      console.error("Error toggling client:", err);
      toast.error("Failed to update status");
    }
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
                    <td>
                        <div className="user-info">
                            <span className="user-name">{c.name}</span>
                        </div>
                    </td>
                    <td>
                        <span className="joined-date">
                        {new Date(c.created_at).toLocaleDateString()}
                        </span>
                    </td>
                    <td>
                        <span className={`badge ${c.active ? "success" : "danger"}`}>
                        {c.active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="actions">
                        <button
                            className="action view"
                            onClick={() => navigate(`/admin/client/${c.user_id}`)}
                            title="View Profile"
                        >
                            <i className="fas fa-eye"></i> View
                        </button>

                        <button
                        className={`btn ${c.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleStatus(c.user_id)}
                        >
                        <i className={`fas ${c.active ? "fa-user-slash" : "fa-user-check"}`}></i>{" "}
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
        )}
      </div>
    </div>
  );
};

export default ClientsTable;