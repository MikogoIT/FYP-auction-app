import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";

export default function ImageUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [currentProfileUrl, setCurrentProfileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch current profile image
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const res = await fetch("/api/getDP", {
          credentials: "include",
        });
  
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server did not return JSON");
        }
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile image");
        }
  
        setCurrentProfileUrl(data.profile_image_url || null);
      } catch (err) {
        console.error("Failed to fetch user profile image", err);
      }
    };
  
    fetchProfile();
  }, []);
  

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
        alert("No file selected.");
        return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        alert("Only JPG, PNG, or WEBP images are allowed.");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("File size must be under 2MB.");
        return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
      
        setUploading(true);
        const formData = new FormData();
        formData.append("image", selectedFile);
      
        const token = localStorage.getItem("token"); // ✅ get JWT from local storage
      
        try {
          const res = await fetch("/api/displayPhoto", {
            method: "POST",
            credentials: "include",
            body: formData,
        });
      
          const data = await res.json();
      
          if (!res.ok) {
            throw new Error(data.message || "Upload failed");
          }
      
          setUploadedUrl(data.imageUrl);
          setCurrentProfileUrl(data.imageUrl); // update avatar
        } catch (err) {
          console.error("Upload failed", err);
          alert("Upload failed: " + err.message);
        } finally {
          setUploading(false);
        }
      };
      

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Profile Photo</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {currentProfileUrl ? (
          <Avatar
            src={currentProfileUrl}
            sx={{ width: 80, height: 80 }}
            alt="Profile"
          />
        ) : (
          <Avatar sx={{ width: 80, height: 80 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
        )}
        <p style={{ margin: 0 }}>
          {currentProfileUrl ? "Current photo" : "No photo set yet"}
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginTop: "1rem" }}
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{ maxWidth: "100%", marginTop: "1rem" }}
        />
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={{ marginTop: "1rem" }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {uploadedUrl && (
        <div style={{ marginTop: "2rem" }}>
          <p>Uploaded to:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
          <img
            src={uploadedUrl}
            alt="Uploaded"
            style={{ display: "block", maxWidth: "100%", marginTop: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}
