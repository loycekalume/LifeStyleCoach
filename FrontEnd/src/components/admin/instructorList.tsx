import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Use navigate instead of window.location
import { getInstructors, toggleUserStatus } from "../../Services/adminService";
import { toast } from "react-toastify"; // Optional: for notifications
import "../../styles/adminTable.css";

interface Instructor {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean; // Ensure this matches your API response (or is_active)
}

const InstructorsTable: React.FC = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Instructors (No Token Needed)
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        // axiosInstance handles credentials automatically
        const data = await getInstructors(); 
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
            setInstructors(data);
            setFilteredInstructors(data);
        } else {
            console.error("API did not return an array", data);
            setInstructors([]);
        }
      } catch (err) {
        console.error("Error fetching instructors:", err);
        toast.error("Failed to load instructors");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const term = value.toLowerCase();
    if (!term.trim()) {
      setFilteredInstructors(instructors);
      return;
    }
    setFilteredInstructors(
      instructors.filter((i) => (i.name || "").toLowerCase().includes(term))
    );
  };

  // ✅ Toggle Status (No Token Needed)
  const handleToggleStatus = async (user_id: number) => {
    try {
      // Call API
      await toggleUserStatus(user_id);
      
      toast.success("Instructor status updated");

      // Optimistic UI Update (Update state immediately without refetching)
      const updateState = (prev: Instructor[]) => 
        prev.map((i) => (i.user_id === user_id ? { ...i, active: !i.active } : i));

      setInstructors(updateState);
      setFilteredInstructors(updateState);

    } catch (err) {
      console.error("Error toggling instructor:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Instructor Management</h2>
        
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
            <p className="loading-text">Loading instructors...</p>
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
                {filteredInstructors.length > 0 ? (
                filteredInstructors.map((i) => (
                    <tr key={i.user_id}>
                    <td>
                        <div className="user-info">
                            <span className="user-name">{i.name}</span>
                        </div>
                    </td>
                    <td>
                        <span className="joined-date">
                        {new Date(i.created_at).toLocaleDateString()}
                        </span>
                    </td>
                    <td>
                        <span className={`badge ${i.active ? "success" : "danger"}`}>
                        {i.active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="actions">
                        <button
                            className="action view"
                            onClick={() => navigate(`/admin/instructor/${i.user_id}`)}
                            title="View Profile"
                        >
                            <i className="fas fa-eye"></i> View
                        </button>

                        <button
                        className={`btn ${i.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleStatus(i.user_id)}
                        >
                        <i className={`fas ${i.active ? "fa-user-slash" : "fa-user-check"}`}></i>{" "}
                        {i.active ? "Deactivate" : "Activate"}
                        </button>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={4} className="no-data">
                    No instructors found
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

export default InstructorsTable;