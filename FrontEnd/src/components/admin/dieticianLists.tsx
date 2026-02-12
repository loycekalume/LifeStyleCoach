import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Use navigate
import { getDieticians, toggleUserStatus } from "../../Services/adminService";
import { toast } from "react-toastify"; // Optional: Notification
import "../../styles/adminTable.css";

interface Dietician {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const DieticiansTable: React.FC = () => {
  const navigate = useNavigate();
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [filteredDieticians, setFilteredDieticians] = useState<Dietician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Dieticians (No Token Needed)
  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        setLoading(true);
        // axiosInstance handles credentials automatically
        const data = await getDieticians();
        
        if (Array.isArray(data)) {
            setDieticians(data);
            setFilteredDieticians(data);
        } else {
            console.error("API did not return an array", data);
            setDieticians([]);
        }
      } catch (err) {
        console.error("Error fetching dieticians:", err);
        toast.error("Failed to load dieticians");
      } finally {
        setLoading(false);
      }
    };
    fetchDieticians();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const term = value.toLowerCase();
    if (!term.trim()) {
      setFilteredDieticians(dieticians);
      return;
    }
    setFilteredDieticians(
      dieticians.filter((d) => (d.name || "").toLowerCase().includes(term))
    );
  };

  // ✅ Toggle Status (No Token Needed)
  const handleToggleStatus = async (user_id: number) => {
    try {
      await toggleUserStatus(user_id);
      
      toast.success("Dietician status updated");

      // Optimistic Update
      const updateState = (prev: Dietician[]) => 
        prev.map((d) => (d.user_id === user_id ? { ...d, active: !d.active } : d));

      setDieticians(updateState);
      setFilteredDieticians(updateState);
    } catch (err) {
      console.error("Error toggling dietician:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Dietician Management</h2>
        
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
            <p className="loading-text">Loading dieticians...</p>
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
                {filteredDieticians.length > 0 ? (
                filteredDieticians.map((d) => (
                    <tr key={d.user_id}>
                    <td>
                        <div className="user-info">
                            <span className="user-name">{d.name}</span>
                        </div>
                    </td>
                    <td>
                        <span className="joined-date">
                        {new Date(d.created_at).toLocaleDateString()}
                        </span>
                    </td>
                    <td>
                        <span className={`badge ${d.active ? "success" : "danger"}`}>
                        {d.active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="actions">
                        <button
                            className="action view"
                            onClick={() => navigate(`/admin/dietician/${d.user_id}`)}
                            title="View Profile"
                        >
                            <i className="fas fa-eye"></i> View
                        </button>

                        <button
                        className={`btn ${d.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleStatus(d.user_id)}
                        >
                        <i className={`fas ${d.active ? "fa-user-slash" : "fa-user-check"}`}></i>{" "}
                        {d.active ? "Deactivate" : "Activate"}
                        </button>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={4} className="no-data">
                    No dieticians found
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

export default DieticiansTable;