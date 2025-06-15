import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goToProfile = () => navigate("/profile");
  const goToSell = () => navigate("/sell");
  const handleBidClick = (auctionId) => navigate(`/bid/${auctionId}`);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // 1) fetch base listings
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();

        // 2) fetch image URL for each listing
        const token = localStorage.getItem("token");
        const enriched = await Promise.all(
          data.listings.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${item.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!imgRes.ok) return { ...item, image_url: null };
              const imgData = await imgRes.json();
              return { ...item, image_url: imgData.imageUrl };
            } catch {
              return { ...item, image_url: null };
            }
          })
        );

        setListings(enriched);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

<<<<<<< HEAD
    const goToSell = () => {
      navigate("/sell");
    };

    const handleBidClick = (auctionId) => {
      navigate(`/bid/${auctionId}`);
    };

    useEffect(() => {
      const fetchListings = async () => {
        try {
          const res = await fetch("/api/listings");
          if(!res.ok){
            const text = await res.text();
            console.error("Error response text:", text);
            throw new Error("Failed to fetch listings");
          }

          const data = await res.json();
          setListings(data.listings);
          console.log("Fetched listings:", data.listings);
        } catch (err) {
          console.error("Failed to fetch listings:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchListings();
    }, []);
  
    return (
=======
  return (
>>>>>>> 649ee69 (try listings have cover img)
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={goToSell} style={buttonStyleBlue}>Sell Item</button>
        <button onClick={goToProfile} style={buttonStyleGray}>Profile</button>
        <button onClick={() => navigate("/mylistings")} style={buttonStyleTeal}>My Listings</button>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px" }}>🛒 Active Auction Listings</h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No listings available.</p>
      ) : (
        <div style={gridContainer}>
          {listings.map((item) => {
            const currentUserId = parseInt(localStorage.getItem("userId"));
            const isOwner = item.seller_id === currentUserId;
            return (
<<<<<<< HEAD
              <div
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => handleBidClick(item.id)}
              >
=======
              <div key={item.id} style={cardStyle}>
                {/* Cover Image */}
                <div style={{ marginBottom: "12px" }}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={coverImageStyle}
                    />
                  ) : (
                    <Avatar variant="square" sx={avatarStyle}>
                      <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                    </Avatar>
                  )}
                </div>

>>>>>>> 649ee69 (try listings have cover img)
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p><strong>Min Bid:</strong> ${item.min_bid}</p>
                <p>
                  <strong>Current Bid:</strong> {item.current_bid !== null && item.current_bid !== undefined 
                    ? `$${item.current_bid}` 
                    : "No bids yet"}
                </p>

                <p><strong>Ends:</strong> {new Date(item.end_date).toLocaleString()}</p>
                <p><strong>Seller:</strong> {item.seller}</p>

                {isOwner ? (
<<<<<<< HEAD
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${item.id}`);
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#ffc107",
                      color: "#333",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBidClick(item.id);
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    💰 Bid
                  </button>
=======
                  <button onClick={() => navigate(`/edit/${item.id}`)} style={buttonStyleEdit}>✏️ Edit</button>
                ) : (
                  <button onClick={() => handleBidClick(item.id)} style={buttonStyleBid}>💰 Bid</button>
>>>>>>> 649ee69 (try listings have cover img)
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

// Reusable styles
const buttonBase = { padding: "8px 16px", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const buttonStyleBlue = { ...buttonBase, backgroundColor: "#007bff" };
const buttonStyleGray = { ...buttonBase, backgroundColor: "#6c757d" };
const buttonStyleTeal = { ...buttonBase, backgroundColor: "#17a2b8" };
const buttonStyleEdit = { marginTop: "10px", padding: "6px 12px", backgroundColor: "#ffc107", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" };
const buttonStyleBid = { marginTop: "10px", padding: "6px 12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const gridContainer = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "30px" };
const cardStyle = { border: "1px solid #ccc", borderRadius: "8px", padding: "16px", backgroundColor: "#f9f9f9" };
const coverImageStyle = { width: "100%", height: "160px", objectFit: "cover", borderRadius: "4px" };
const avatarStyle = { width: "100%", height: 160, bgcolor: "#eee" };

export default Dashboard;
