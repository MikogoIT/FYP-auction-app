// src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Material Web buttons
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Dashboard = () => {
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error("Failed to fetch");
        const { listings } = await res.json();

        const enriched = await Promise.all(
          listings.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.id)}`
              );
              if (!imgRes.ok) throw new Error("No image");
              const { imageUrl } = await imgRes.json();
              return { ...item, image_url: imageUrl };
            } catch {
              return { ...item, image_url: null };
            }
          })
        );

        setRecentListings(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentListings();
  }, []);

  const currentUserId = parseInt(localStorage.getItem("userId"), 10);
  const handleBidClick = (id) => navigate(`/bid/${id}`);
  const handleEditClick = (id) => navigate(`/edit/${id}`);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        🛒 Recent Listings
      </h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading listings…</p>
      ) : recentListings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No recent listings available.</p>
      ) : (
        <>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 1 },
              600: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
            }}
            style={{ paddingBottom: 40 }} // room for pagination dots
          >
            {recentListings.map((item) => {
              const isOwner = item.seller_id === currentUserId;

              return (
                <SwiperSlide key={item.id}>
                  <div style={cardStyle}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={imageStyle}
                      />
                    ) : (
                      <Avatar variant="square" sx={avatarStyle}>
                        <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                      </Avatar>
                    )}

                    <div style={detailsStyle}>
                      <div>
                        <h3 style={{ margin: 0, marginBottom: 8 }}>
                          {item.title}
                        </h3>
                        <p style={{ margin: "4px 0", color: "#555" }}>
                          {item.description}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Min Bid:</strong> ${item.min_bid}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Current Bid:</strong>{" "}
                          {item.current_bid != null
                            ? `$${item.current_bid}`
                            : "No bids yet"}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Ends:</strong>{" "}
                          {new Date(item.end_date).toLocaleString()}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Seller:</strong> {item.seller}
                        </p>
                      </div>

                      <div style={{ marginTop: 16 }}>
                        {isOwner ? (
                          <md-filled-button
                            onClick={() => handleEditClick(item.id)}
                            style={{ width: "100%" }}
                          >
                            ✏️ Edit
                          </md-filled-button>
                        ) : (
                          <md-filled-button
                            onClick={() => handleBidClick(item.id)}
                            style={{ width: "100%" }}
                          >
                            💰 Bid
                          </md-filled-button>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div style={{ textAlign: "center", marginTop: 30 }}>
            <md-filled-tonal-button
              onClick={() => navigate("/ListingPage")}
            >
              🔍 View all listings
            </md-filled-tonal-button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

// ─── styles ─────────────────────────────────────────────────

const cardStyle = {
  maxWidth: 300,
  margin: "0 auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
};

const imageStyle = {
  width: "100%",
  height: 200,
  objectFit: "cover",
};

const avatarStyle = {
  width: "100%",
  height: 200,
  bgcolor: "#eee",
};

const detailsStyle = {
  backgroundColor: "#f1f0f0",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  borderTop: "1px solid #eee",
};
