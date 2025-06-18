import React, { useEffect, useState } from "react";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await fetch("/api/mylistings", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setListings(data.listings);
      } catch (err) {
        console.error("Failed to fetch my listings:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>My Listings</h2>
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : listings.length === 0 ? (
        <p style={{ textAlign: "center" }}>You haven’t listed any items yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {listings.map((item) => (
            <div key={item.id} style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9"
            }}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p><strong>Min Bid:</strong> ${item.min_bid}</p>
              <p><strong>Ends:</strong> {new Date(item.end_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;