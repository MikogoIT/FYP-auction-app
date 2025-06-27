import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import '@material/web/button/filled-tonal-button.js';
import '@material/web/icon/icon.js';
import EditIcon from "@mui/icons-material/Edit";
import TelegramConnect from "../components/TelegramConnect";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  // Fetch user + photo
  useEffect(() => {
    async function fetchProfile() {
      try {
        const [pRes, phRes] = await Promise.all([
          fetch("/api/profile", { credentials: "include" }),
          fetch("/api/displayPhoto", { credentials: "include" })
        ]);
        const pData = await pRes.json();
        const phData = await phRes.json();
        if (!pRes.ok) throw new Error(pData.message);
        if (!phRes.ok) throw new Error(phData.message);
        const merged = { ...pData.user, profile_image_url: phData.profile_image_url };
        setUser(merged);
        setEditableUser(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleCancel = () => {
    setEditableUser(user);
    setEditing(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editableUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      setEditing(false);
      alert("✅ Profile updated!");
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      {/* Greeting */}
      <h1 style={{ marginBottom: 32 }}>Hello, {user.username}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Avatar */}
        <Avatar
          src={user.profile_image_url || undefined}
          sx={{ width: 120, height: 120 }}
          alt="Profile"
        />

        {/* Edit Button */}
        {!editing && (
          <md-filled-tonal-button onClick={() => setEditing(true)}>
            <md-icon slot="icon">edit</md-icon>
            Edit Profile
          </md-filled-tonal-button>
        )}

        {/* Details or Edit Form */}
        {!editing ? (
          <div style={{ width: '100%', maxWidth: 400 }}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone Number:</strong> {user.phone_number}</p>
            <p><strong>Address:</strong> {user.address}</p>
          </div>
        ) : (
          <form style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={editableUser.email}
              onChange={(e) => setEditableUser({ ...editableUser, email: e.target.value })}
            />
            <TextField
              label="Username"
              fullWidth
              value={editableUser.username}
              onChange={(e) => setEditableUser({ ...editableUser, username: e.target.value })}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={editableUser.phone_number}
              onChange={(e) => setEditableUser({ ...editableUser, phone_number: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              value={editableUser.address}
              onChange={(e) => setEditableUser({ ...editableUser, address: e.target.value })}
            />

            {/* Save/Cancel */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <md-filled-tonal-button onClick={handleSaveProfile} disabled={saving}>
                Save
              </md-filled-tonal-button>
              <md-filled-tonal-button onClick={handleCancel}>
                Cancel
              </md-filled-tonal-button>
            </div>
          </form>
        )}
      </div>

      {/* Telegram Connect */}
      <div style={{ marginTop: 32 }}>
        <TelegramConnect user={user} />
      </div>
    </div>
  );
}
