import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async (query = "") => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = query
        ? `/api/users/admin/search?q=${encodeURIComponent(query)}`
        : `/api/users/admin/users`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else alert(data.message || "Failed to fetch users");
    } catch (err) {
      console.error("Fetch/search users failed:", err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchUsers(value);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👑 Admin Panel - Manage Users</h2>

      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="🔍 Search by username or email..."
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Admin</th>
            <th style={thStyle}>Frozen</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ backgroundColor: user.is_frozen ? "#f8d7da" : "#ffffff" }}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.username}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.phone_number}</td>
              <td style={tdStyle}>{user.is_admin ? "✅" : "❌"}</td>
              <td style={tdStyle}>{user.is_frozen ? "❄️" : "✔️"}</td>
              <td style={tdStyle}>
                {!user.is_admin && (
                  <>
                    <button
                      onClick={() => toggleFreeze(user.id)}
                      style={{
                        padding: "6px 10px",
                        marginRight: "10px",
                        backgroundColor: user.is_frozen ? "#28a745" : "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {user.is_frozen ? "Unfreeze" : "Freeze"}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

export default AdminPage;
