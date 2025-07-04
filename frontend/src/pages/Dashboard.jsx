// src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch recent listings + their images
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const { listings } = await res.json();

        const enriched = await Promise.all(
          listings.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.id)}`
              );
              if (!imgRes.ok) throw new Error();
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
    })();
  }, []);

  const currentUserId = +localStorage.getItem("userId");
  const handleBid = (id) => navigate(`/bid/${id}`);
  const handleEdit = (id) => navigate(`/edit/${id}`);

  return (
    <div className="dashboardCanvas">

      {/* page title */}
      <div className="profileTitle">Recent Listings</div>

      {/* content */}
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
            className="dashboard-swiper"
          >
            {recentListings.map((item) => {
              const isOwner = item.seller_id === currentUserId;
              return (
                <SwiperSlide key={item.id}>
                  <div className="cardStyle">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="imageStyle"
                      />
                    ) : (
                      <Avatar 
                        variant="square" 
                        sx={{
                          width: "100%",
                          height: 200,
                          bgcolor: "#eee",
                      }}> 
                        <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                      </Avatar>
                    )}
                    <div className="detailsStyle">
                      <h3 style={{ margin: 0, marginBottom: 8 }}>
                        {item.title}
                      </h3>
                      <p style={{ margin: "4px 0", color: "#555" }}>
                        {item.description}
                      </p>
                      <div style={{ marginTop: 16 }}>
                        {isOwner ? (
                          <md-filled-button
                            onClick={() => handleEdit(item.id)}
                            style={{ width: "100%" }}
                          >
                            Edit
                          </md-filled-button>
                        ) : (
                          <md-filled-button
                            onClick={() => handleBid(item.id)}
                            style={{ width: "100%" }}
                          >
                            Bid
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
            <md-filled-tonal-button onClick={() => navigate("/ListingPage")}>
              View all listings
            </md-filled-tonal-button>
          </div>
        </>
      )}
    </div>
  );
}