import React, { useEffect, useState } from "react";
import { getDieticians, toggleUserStatus } from "../../Services/adminService";
import "../../styles/adminTable.css";

interface Dietician {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const DieticiansTable: React.FC = () => {
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [filteredDieticians, setFilteredDieticians] = useState<Dietician[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getDieticians(token);
        setDieticians(data);
        setFilteredDieticians(data);
      } catch (err) {
        console.error("Error fetching dieticians:", err);
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

  const handleToggleStatus = async (user_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { active } = await toggleUserStatus(token, user_id);

      setDieticians((prev) =>
        prev.map((d) => (d.user_id === user_id ? { ...d, active } : d))
      );
      setFilteredDieticians((prev) =>
        prev.map((d) => (d.user_id === user_id ? { ...d, active } : d))
      );
    } catch (err) {
      console.error("Error toggling dietician:", err);
    }
  };

  const handleBack = () => {
    window.location.href = "/admin";
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Dietician Management</h2>
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
            {filteredDieticians.length > 0 ? (
              filteredDieticians.map((d) => (
                <tr key={d.user_id}>
                  <td>{d.name}</td>
                  <td>
                    <span className="joined-date">
                      {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${d.active ? "success" : "danger"}`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions">
                    <a
                      href={`/admin/dietician/${d.user_id}`}
                      className="action view"
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i> View
                    </a>

                    <button
                      className={`btn ${
                        d.active ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(d.user_id)}
                    >
                      <i
                        className={`fas ${
                          d.active ? "fa-user-slash" : "fa-user-check"
                        }`}
                      ></i>{" "}
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
      </div>
    </div>
  );
};

export default DieticiansTable;
