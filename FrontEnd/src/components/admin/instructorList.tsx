import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInstructors } from "../../Services/adminService"; 
import "../../styles/adminTable.css";

interface Instructor {
  user_id: number;
  name: string;
  created_at: string;
  active: boolean;
}

const InstructorsTable: React.FC = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const data = await getInstructors();
        if (Array.isArray(data)) {
          setInstructors(data);
          setFilteredInstructors(data);
        } else {
          setInstructors([]);
        }
      } catch (err) {
        console.error("Error fetching instructors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // ✅ Search Logic
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

  return (
    <div className="clients-container">
      {/* HEADER */}
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
          <button onClick={() => navigate("/admin")} className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-text">Loading instructors...</p>
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
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((i, index) => (
                  <tr key={i.user_id}>
                    {/* Numbering Column */}
                    <td>{index + 1}</td>
                    
                    {/* Name Column */}
                    <td>
                      <div className="user-info">
                        <span className="user-name">{i.name}</span>
                      </div>
                    </td>

                    {/* Date Joined Column */}
                    <td>
                      <span className="joined-date">
                        {new Date(i.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="no-data">
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