// src/pages/EditListing.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import { IMG_BASE_URL } from "../global-vars.jsx";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  // listing data
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // cover image states
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // fetch listing + cover
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) fetch listing
        const resList = await fetch(`/api/listings/${id}`);
        const listData = await resList.json();
        if (!resList.ok) throw new Error(listData.message);
        setListing(listData.listing);

        // 2) fetch existing cover
        const token = localStorage.getItem("token");
        const resImg = await fetch(`/api/listingimg?listingId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const imgData = await resImg.json();
        if (resImg.ok && imgData.imageUrl) {
          setCoverUrl(imgData.imageUrl);
        }
      } catch (err) {
        setError("❌ " + err.message);
      }
    };
    fetchData();
  }, [id]);

  // handlers for listing fields
  const handleChange = (e) =>
    setListing({ ...listing, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    // validation
    if (parseFloat(listing.min_bid) <= 0) {
      setError("❌ Minimum bid must be greater than 0.");
      return;
    }
    if (new Date(listing.end_date) < new Date()) {
      setError("❌ End date must be in the future.");
      return;
    }

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          min_bid: parseFloat(listing.min_bid),
          end_date: listing.end_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("✅ Listing updated successfully");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  // cover image handlers
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleUploadCover = async () => {
    if (!coverFile) return;
    setUploadingCover(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", coverFile);
      formData.append("listingId", id);

      const res = await fetch("/api/listingimg", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCoverUrl(data.imageUrl);
      setCoverPreview(null);
      setCoverFile(null);
      alert("✅ Cover image uploaded!");
    } catch (err) {
      alert("❌ Upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  if (!listing) {
    return <p style={{ textAlign: "center" }}>Loading listing...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>✏️ Edit Listing</h2>

      {/* Cover image preview / placeholder */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {coverUrl && coverUrl.startsWith(IMG_BASE_URL) ? (
          <img
            src={coverUrl}
            alt="Cover"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        ) : (
          <Avatar
            variant="square"
            sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
          >
            <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
          </Avatar>
        )}

        {/* Upload new cover only when editing */}
        <div style={{ marginTop: "10px" }}>
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                marginTop: "10px",
                borderRadius: "4px",
              }}
            />
          )}
          <button
            type="button"
            onClick={handleUploadCover}
            disabled={uploadingCover || !coverFile}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {uploadingCover ? "Uploading..." : "Upload Cover Image"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Title *</label>
        <input
          name="title"
          value={listing.title}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={listing.description}
          onChange={handleChange}
          rows="4"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>Minimum Bid *</label>
        <input
          name="min_bid"
          type="number"
          value={listing.min_bid}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>End Date *</label>
        <input
          name="end_date"
          type="datetime-local"
          value={listing.end_date.slice(0, 16)}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Update Listing
        </button>

        <button
          type="button"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete this listing?")) return;
            try {
              const token = localStorage.getItem("token");
              const res = await fetch(`/api/listings/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message);
              alert("✅ Listing deleted successfully.");
              navigate("/dashboard");
            } catch (err) {
              alert("❌ Failed to delete listing: " + err.message);
            }
          }}
          style={{
            marginTop: "10px",
            padding: "10px",
            width: "100%",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🗑️ Delete Listing
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
      </form>
    </div>
  );
}
