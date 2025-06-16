import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToSell = () => {
    navigate("/sell");
  };

  const handleBidClick = (auctionId) => {
    navigate(`/bid/${auctionId}`);
  };

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error("Failed to fetch recent listings");

        const data = await res.json();
        setRecentListings(data.listings);
      } catch (err) {
        console.error("Fetch recent listings error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentListings();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          onClick={goToSell}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Sell Item
        </button>

        <button
          onClick={goToProfile}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Profile
        </button>

        <button
          onClick={() => navigate("/mylistings")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          My Listings
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        🛒 Recently Listed Auctions
      </h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading listings...</p>
      ) : recentListings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No recent listings available.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "30px"
            }}
          >
            {recentListings.map((item) => {
              const currentUserId = parseInt(localStorage.getItem("userId"));
              const isOwner = item.seller_id === currentUserId;

              return (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f9f9f9"
                  }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p><strong>Min Bid:</strong> ${item.min_bid}</p>
                  <p><strong>Ends:</strong> {new Date(item.end_date).toLocaleString()}</p>
                  <p><strong>Seller:</strong> {item.seller}</p>

                  {isOwner ? (
                    <button
                      onClick={() => navigate(`/edit/${item.id}`)}
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
                      onClick={() => handleBidClick(item.id)}
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
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={() => navigate("/ListingPage")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              🔍 View All Listings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
