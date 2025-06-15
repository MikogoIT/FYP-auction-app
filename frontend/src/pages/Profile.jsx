// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  // Fetch profile (data + current photo URL)
    useEffect(() => {
    const fetchProfileAndPhoto = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // fire both requests in parallel
        const [profileRes, photoRes] = await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/displayPhoto", { headers })
        ]);

        const [profileData, photoData] = await Promise.all([
          profileRes.json(),
          photoRes.json()
        ]);

        if (!profileRes.ok) throw new Error(profileData.message);
        if (!photoRes.ok)   throw new Error(photoData.message);

        // merge the photo URL into your user object
        const mergedUser = {
          ...profileData.user,
          profile_image_url: photoData.profile_image_url
        };

        setUser(mergedUser);
        setEditableUser(mergedUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPhoto();
  }, []);


  const handleGoBack = () => navigate("/dashboard");
  const handleChange = (field, value) =>
    setEditableUser({ ...editableUser, [field]: value });
  const handleCancel = () => {
    setEditableUser(user);
    setEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!editableUser.phone_number?.trim()) {
      alert("❌ Phone number is required");
      return;
    }
    if (!editableUser.email?.trim()) {
      alert("❌ Email is required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
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
      setEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Image upload handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return alert("No file selected.");
    if (!ALLOWED_TYPES.includes(file.type))
      return alert("Only JPG, PNG, or WEBP images are allowed.");
    if (file.size > MAX_FILE_SIZE)
      return alert("File size must be under 2MB.");

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/displayPhoto", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // update user state with new photo URL
      setUser((u) => ({ ...u, profile_image_url: data.imageUrl }));
      setPreviewUrl(null);
      setSelectedFile(null);
      alert("✅ Photo uploaded!");
    } catch (err) {
      alert("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading profile...</p>;
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>
    );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Top Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={handleGoBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Dashboard
        </button>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Change
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          👤 User Profile
        </h2>

        {/* Avatar & Upload */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
            gap: "12px",
          }}
        >
          {user.profile_image_url ? (
            <Avatar
              src={user.profile_image_url}
              sx={{ width: 80, height: 80 }}
              alt="Profile"
            />
          ) : (
            <Avatar sx={{ width: 80, height: 80 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
          )}

          {editing && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100px",
                    borderRadius: "8px",
                    marginTop: "8px",
                  }}
                />
              )}
              <button
                onClick={handleUploadPhoto}
                disabled={!selectedFile || uploading}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
            </>
          )}
        </div>

        {/* Profile Fields */}
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        {editing ? (
          <>
            <label>Username:</label>
            <input
              value={editableUser.username}
              onChange={(e) =>
                handleChange("username", e.target.value)
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <label>Phone Number:</label>
            <input
              value={editableUser.phone_number}
              onChange={(e) =>
                handleChange("phone_number", e.target.value)
              }
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <label>Address:</label>
            <input
              value={editableUser.address}
              onChange={(e) =>
                handleChange("address", e.target.value)
              }
              style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Phone Number:</strong> {user.phone_number}
            </p>
            <p>
              <strong>Address:</strong> {user.address}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
