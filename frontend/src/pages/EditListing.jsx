import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditListing = () => {
  const { id } = useParams(); // Get product id from URL
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get raw product data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setListing(data.listing);
      } catch (err) {
        setError("❌ " + err.message);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setListing({ ...listing, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

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

  if (!listing) return <p style={{ textAlign: "center" }}>Loading listing...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>✏️ Edit Listing</h2>

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
          style={{ padding: "10px", width: "100%", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}
        >
          Update Listing
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
      </form>
    </div>
  );
};

export default EditListing;
