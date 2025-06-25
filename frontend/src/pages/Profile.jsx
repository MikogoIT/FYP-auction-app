import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import TelegramConnect from "../components/TelegramConnect";

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

  useEffect(() => {
    async function fetchProfileAndPhoto() {
      try {
        const [profileRes, photoRes] = await Promise.all([
          fetch("/api/profile", { credentials: "include" }),
          fetch("/api/displayPhoto", { credentials: "include" })
        ]);
        const profileData = await profileRes.json();
        const photoData = await photoRes.json();
        if (!profileRes.ok) throw new Error(profileData.message);
        if (!photoRes.ok)   throw new Error(photoData.message);
        const merged = { ...profileData.user, profile_image_url: photoData.profile_image_url };
        setUser(merged);
        setEditableUser(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndPhoto();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading profile...</p>;
  if (error)   return <p style={{ color: "red", textAlign: "center" }}>❌ {error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Greeting */}
      <h1 style={{ marginBottom: '24px' }}>Hello, {user.username}</h1>

      {/* Profile Block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Avatar */}
        <Avatar
          src={user.profile_image_url || undefined}
          sx={{ width: 120, height: 120 }}
          alt="Profile"
        />

        {/* Details */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone Number:</strong> {user.phone_number}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>

        {/* Edit Profile Button */}
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setEditing(true)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Edit Form (shown when editing) */}
      {editing && (
        <div style={{ marginTop: '32px', maxWidth: '500px', margin: '0 auto' }}>
          {/* ...existing editable form fields and save/cancel buttons... */}
        </div>
      )}

      {/* Telegram Connect */}
      <TelegramConnect user={user} />
    </div>
  );
}
