import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editableUser, setEditableUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token"); 
      
          const res = await fetch("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
      
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server did not return JSON");
          }
      
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
      
        setUser(data.user);
        setEditableUser(data.user); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const handleChange = (field, value) => {
    setEditableUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editableUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser(data.user);
      setEditableUser(data.user);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading profile...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Dashboard button */}
      <button
        onClick={handleGoBack}
        style={{
          padding: "8px 16px",
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Dashboard
      </button>



      {/* profile card */}
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👤 Edit Profile</h2>

        <p><strong>Email:</strong> {user.email}</p>

        <label>Username:</label>
        <input
          value={editableUser.username}
          onChange={(e) => handleChange("username", e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <label>Phone Number:</label>
        <input
          value={editableUser.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <label>Address:</label>
        <input
          value={editableUser.address}
          onChange={(e) => handleChange("address", e.target.value)}
          style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
