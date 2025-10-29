import React, { useEffect, useState } from "react";
import { getInstructors, toggleUserStatus } from "../../Services/adminService";
import "../../styles/adminTable.css";

interface Instructor {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const InstructorsTable: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getInstructors(token);
        setInstructors(data);
        setFilteredInstructors(data);
      } catch (err) {
        console.error("Error fetching instructors:", err);
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

  const handleToggleStatus = async (user_id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { active } = await toggleUserStatus(token, user_id);

      setInstructors((prev) =>
        prev.map((i) => (i.user_id === user_id ? { ...i, active } : i))
      );
      setFilteredInstructors((prev) =>
        prev.map((i) => (i.user_id === user_id ? { ...i, active } : i))
      );
    } catch (err) {
      console.error("Error toggling instructor:", err);
    }
  };

  const handleBack = () => {
    window.location.href = "/admin";
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Instructor Management</h2>
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
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((i) => (
                <tr key={i.user_id}>
                  <td>{i.name}</td>
                  <td>
                    <span className="joined-date">
                      {new Date(i.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${i.active ? "success" : "danger"}`}
                    >
                      {i.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions">
                    <a
                      href={`/admin/instructor/${i.user_id}`}
                      className="action view"
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i> View
                    </a>

                    <button
                      className={`btn ${
                        i.active ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(i.user_id)}
                    >
                      <i
                        className={`fas ${
                          i.active ? "fa-user-slash" : "fa-user-check"
                        }`}
                      ></i>{" "}
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
      </div>
    </div>
  );
};

export default InstructorsTable;
