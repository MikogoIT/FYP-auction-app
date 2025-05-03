import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId")
      navigate("/login"); 
    };

    const goToProfile = () => {
        navigate("/profile");
    };

    const goToSell = () => {
      navigate("/sell");
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
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        🛒 Active Auction Listings
      </h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No listings available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "30px"
          }}
        >
          {listings.map((item) => {
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

                {isOwner && (
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;