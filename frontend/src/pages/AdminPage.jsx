import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const fetchUsers = async (query = "", page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = query
        ? `/api/users/admin/search?q=${encodeURIComponent(query)}`
        : `/api/users/admin/users`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPage(page);
      } else {
        alert(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch/search users failed:", err);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchUsers(searchQuery, 1); // Reset to first page on new search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleFreeze = async (userId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/users/admin/freeze/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      alert("Status updated");
      fetchUsers(); 
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    alert("Request failed");
  }
 };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/users/admin/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) fetchUsers();
      else alert(data.message || "Failed to delete user");
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  const currentPageUsers = users.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  useEffect(() => {
    fetchUsers(); // Initial load
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👑 Admin Panel - Manage Users</h2>

      <div style={{ display: "flex", marginBottom: "20px", gap: "10px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="🔍 Search by username or email..."
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button onClick={handleSearch} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
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
              {currentPageUsers.map((user) => (
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

          {/* Pagination Controls */}
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ◀ Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next ▶
            </button>
          </div>
        </>
      )}
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
