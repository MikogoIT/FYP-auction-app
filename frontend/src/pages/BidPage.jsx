import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BidPage = () => {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [minBid, setMinBid] = useState(null);
  const navigate = useNavigate();

  // Get current auction information
  useEffect(() => {
    const fetchAuctionInfo = async () => {
      const res = await fetch(`/api/auction/${id}`);
      const data = await res.json();

      const lastBid = data.bids[0]?.amount;
      const basePrice = parseFloat(data.listing.min_price);
      const priceNow = lastBid ? lastBid : basePrice;

      setCurrentPrice(priceNow);
      setMinBid((priceNow * 1.02).toFixed(2));
    };

    fetchAuctionInfo();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (parseFloat(bidAmount) < minBid) {
        setMessage(`❌ Your bid must be at least $${minBid}`);
        return;
      }

      const res = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          auction_id: id,
          bid_amount: parseFloat(bidAmount)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Bid submitted!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: "20px",
          padding: "8px 12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }}
      >
        ⬅ Back to Listings
      </button>
    
      <h2 style={{ textAlign: "center" }}>💰 Place Your Bid</h2>
      {currentPrice !== null && (
        <div style={{ marginBottom: "12px" }}>
          <p>Current Price: ${currentPrice}</p>
          <p>Min Required Bid (≥ 102%): ${minBid}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>Bid Amount ($):</label>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          required
          min={minBid}
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