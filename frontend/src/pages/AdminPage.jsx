import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const navigate = useNavigate(); 

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryMsg("");

    if (!newCategory.trim()) {
      setCategoryMsg("❌ Category name is required");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategoryMsg("Category created successfully");
        setNewCategory("");
      } else {
        setCategoryMsg("❌ " + (data.message || "Creation failed"));
      }
    } catch (err) {
      console.error("Create category error:", err);
      setCategoryMsg("❌ Server error");
    }
  };

  const fetchUsers = async (query = "", page = 1) => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/api/admin/search?q=${encodeURIComponent(query)}` 
        : `/api/admin/users`;

      const res = await fetch(endpoint, {
        credentials: "include", 
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
    try {
      const res = await fetch(`/api/users/admin/freeze/${userId}`, {
        method: "PUT",
        credentials: "include", 
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

    try {
      const res = await fetch(`/api/users/admin/delete/${userId}`, {
        method: "DELETE",
        credentials: "include", 
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
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        ← Back
      </button>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👑 Admin Panel - Manage Users</h2>
      
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "30px" }}>
        <button
          onClick={() => navigate("/admin/create-category")}
          style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          ➕ Create Category
        </button>
        <button
          onClick={() => navigate("/admin/search-category")}
          style={{ padding: "10px 20px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          🔍 Search Category
        </button>
      </div>

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
                <th style={thStyle}>Suspend</th>
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
                          {user.is_frozen ? "Unsuspend" : "Suspend"}
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
