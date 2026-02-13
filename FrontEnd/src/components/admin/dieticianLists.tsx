import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDieticians } from "../../Services/adminService"; // ✅ Removed unused imports
import { toast } from "react-toastify";
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

  // ✅ Fetch Dieticians
  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        setLoading(true);
        const data = await getDieticians();
        
        if (Array.isArray(data)) {
            setDieticians(data);
            setFilteredDieticians(data);
        } else {
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
                <th style={{ width: "50px" }}>#</th>
                <th>Name</th>
                <th>Date Joined</th>
                </tr>
            </thead>

            <tbody>
                {filteredDieticians.length > 0 ? (
                filteredDieticians.map((d, index) => (
                    <tr key={d.user_id}>
                    {/* Numbering */}
                    <td>{index + 1}</td>
                    
                    {/* Name */}
                    <td>
                        <div className="user-info">
                            <span className="user-name">{d.name}</span>
                        </div>
                    </td>
                    
                    {/* Date Joined */}
                    <td>
                        <span className="joined-date">
                        {new Date(d.created_at).toLocaleDateString()}
                        </span>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={3} className="no-data">
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