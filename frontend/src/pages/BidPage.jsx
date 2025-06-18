import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BidPage = () => {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          auction_id: id,
          bid_amount: parseFloat(bidAmount)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Bid submitted!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
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
      <h2 style={{ textAlign: "center" }}>Place Your Bid</h2>
      <form onSubmit={handleSubmit}>
        <label>Bid Amount ($):</label>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />
        <button
          type="submit"
          style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
        >
          Submit Bid
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default BidPage;
