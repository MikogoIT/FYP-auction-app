// src/pages/BidPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Typography } from "@mui/material";
import "@material/web/button/filled-button.js";

export default function BidPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");

  // 1) Fetch full listing details
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error("Failed to load listing");
        const data = await res.json();
        setListing(data.listing);  // ← grab the inner object
      } catch (err) {
        console.error(err);
      }
    }
    fetchListing();
  }, [id]);

  // 2) Fetch minimum‐allowed bid
  useEffect(() => {
    async function fetchMinAllowed() {
      try {
        const res = await fetch(`/api/auctions/${id}/min-bid`);
        if (!res.ok) throw new Error("Failed to load min bid");
        const data = await res.json();
        setMinPrice(data.min_allowed);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMinAllowed();
  }, [id]);

  // 3) Submit your bid
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const amount = parseFloat(bidAmount);
    if (amount <= minPrice) {
      setMessage(`❌ The bid must be higher than $${minPrice.toFixed(2)}`);
      return;
    }
    if (amount > 99999999.99) {
      alert("The bid amount cannot exceed 99,999,999.99");
      return;
    }
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auction_id: id, bid_amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Bid submitted!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Loading state
  if (!listing || minPrice === null) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography>Loading auction info…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 500,
        m: "50px auto",
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        boxSizing: "border-box",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#ddd",
          border: "none",
          padding: "8px 12px",
          borderRadius: 4,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Back
      </button>

      {/* Listing Details */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              borderRadius: 4,
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
        <Typography variant="h6" sx={{ mt: 2 }}>
          {listing.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ends: {new Date(listing.end_date).toLocaleString("en-SG")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {listing.description}
        </Typography>
        <Typography variant="subtitle2">
          Starting bid: <strong>${listing.min_bid}</strong>
        </Typography>
        <Typography variant="subtitle2">
          Current bid:{" "}
          {listing.current_bid != null
            ? `$${listing.current_bid}`
            : "No bids yet"}
        </Typography>
      </Box>

      {/* Bid Form */}
      <Typography variant="h6" align="center" gutterBottom>
        💰 Place Your Bid
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Minimum bid: <strong>${minPrice.toFixed(2)}</strong>
      </Typography>

      <form onSubmit={handleSubmit}>
        <label htmlFor="bidAmount">Bid Amount ($):</label>
        <input
          id="bidAmount"
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          required
          min={minPrice}
          step="0.01"
          style={{
            width: "100%",
            padding: "8px",
            margin: "8px 0 16px",
            boxSizing: "border-box",
          }}
        />
        <md-filled-button
          type="submit"
          disabled={message.startsWith("✅")}
          style={{ width: "100%", padding: "10px" }}
        >
          Submit Bid
        </md-filled-button>
      </form>

      {message && (
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 2,
            color: message.startsWith("✅") ? "success.main" : "error.main",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
