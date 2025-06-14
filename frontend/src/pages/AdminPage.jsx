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

  const toggleFreeze = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/admin/freeze/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ User status updated");
        fetchUsers(); // Refresh the user list
      } else {
        alert("❌ " + (data.message || "Failed to update status"));
      }
    } catch (err) {
      console.error("Freeze/unfreeze failed:", err);
      alert("❌ Request failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>👑 Admin Panel - All Users</h2>
      <ul>
        {users.map((user) => (
          <div key={user.id} style={{ marginBottom: "10px" }}>
            <span>
              {user.username} (ID: {user.id}) {user.is_admin ? "[Admin]" : ""}
            </span>
            {!user.is_admin && (
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => toggleFreeze(user.id)}
              >
                {user.is_frozen ? "Unfreeze" : "Freeze"}
              </button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
