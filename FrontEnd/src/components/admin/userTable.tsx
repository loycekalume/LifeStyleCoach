import React, { useEffect, useState } from "react";
import { getAllUsers, toggleUserStatus } from "../../Services/adminService";
import { toast } from "react-toastify"; // Optional: for notifications

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Function to fetch users (No Token Needed)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // 👇 CALL SERVICE DIRECTLY (No arguments)
      const data = await getAllUsers();
      
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      // Optional: Handle 401 specifically if needed
      if (err.response?.status === 401) {
         console.warn("User session expired");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Function to toggle status
  const handleAction = async (userId: number) => {
      try {
          await toggleUserStatus(userId);
          toast.success("User updated");
          fetchUsers(); // Refresh table
      } catch (error) {
          console.error("Action failed", error);
          toast.error("Failed to update user");
      }
  }

  return (
    <section className="table-section">
      <h2>User Management</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div>{u.name}</div>
                    <div style={{ fontSize: "0.85em", color: "#666" }}>{u.email}</div>
                  </td>
                  <td>{u.role}</td>
                  <td>
                    {u.status === "Verified" ? (
                      <span className="badge success">Verified</span>
                    ) : (
                      <span className="badge pending">Pending</span>
                    )}
                  </td>
                  <td>{u.joined}</td>
                  <td>
                    <button 
                        onClick={() => handleAction(u.id)} 
                        style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
                    >
                        Toggle Status
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default UserTable;