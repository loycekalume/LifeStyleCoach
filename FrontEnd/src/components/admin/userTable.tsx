import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../Services/adminService";

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
  joined: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // stored on login
        if (!token) throw new Error("Unauthorized: No token found");
        const data = await getAllUsers(token);
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
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
                  <a href="#">View</a> | <a href="#" className="muted">Action</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default UserTable;
