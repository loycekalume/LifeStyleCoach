import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../Services/adminService";


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joined: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Function to fetch users (No Token Needed)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      //  CALL SERVICE DIRECTLY (No arguments)
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
             
              <th>Joined</th>
              
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
                 
                  <td>{u.joined}</td>
                  
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