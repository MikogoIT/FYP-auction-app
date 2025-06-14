import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        alert(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch users failed:", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>👑 Admin Panel - All Users</h2>
      <button onClick={fetchUsers}>Fetch All Users</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email} - {user.phone_number}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
