import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BidPage = () => {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMinAllowed() {
      try {
        const res = await fetch(`/api/auctions/${id}/min-bid`);

        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch failed: ${text}`);
        }

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setMinPrice(data.min_allowed);
        } else {
          throw new Error("Response is not JSON");
        }
      } catch (err) {
        console.error("Error fetching min bid:", err);
      }
    }

    fetchMinAllowed();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(bidAmount) < minPrice) {
      setMessage(`❌ Bid must be at least $${minPrice.toFixed(2)}`);
      return;
    }

    if (minPrice > 99999999.99) {
      alert("The bid amount cannot exceed 99999999.99");
      return;
    }
  
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
        className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded mb-4"
      >
        ← Back
      </button>

      <h2 style={{ textAlign: "center" }}>💰 Place Your Bid</h2>
      {minPrice !== null ? (
        <>
          <p>Minimum bid: <strong>${minPrice.toFixed(2)}</strong></p>
          <form onSubmit={handleSubmit}>
            <label>Bid Amount ($):</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
              min={minPrice}
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
        </>
      ) : (
        <p>Loading auction info...</p>
      )}
    </div>
  );
};

export default BidPage;
