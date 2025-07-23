// src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ListingCard from "../components/ListingCard";

// Web components
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});

  // Load watchlist to know which items are liked
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/watchlist/", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const map = {};
        data.forEach(item => { map[item.auction_id] = true; });
        setLikedMap(map);
      } catch (err) {
        console.error("Could not load watchlist:", err);
      }
    })();
  }, []);

  // Fetch recent listings and enrich with images
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const { listings } = await res.json();

        const enriched = await Promise.all(
          listings.map(async item => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.id)}`
              );
              const { imageUrl } = await imgRes.json();
              return { ...item, image_url: imageUrl };
            } catch {
              return { ...item, image_url: null };
            }
          })
        );

        setRecentListings(enriched);
      } catch (err) {
        console.error("Failed to fetch recent listings:", err);
        setRecentListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentUserId = Number(localStorage.getItem("userId"));

  const handleToggleLike = async id => {
    const isLiked = !!likedMap[id];
    const url = isLiked ? "/api/watchlist/remove" : "/api/watchlist/add";
    const method = isLiked ? "DELETE" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: id }),
      });
      if (!res.ok) throw new Error();
      setLikedMap(m => ({ ...m, [id]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = id => navigate(`/bid/${id}`);
  const handleEditClick = id => navigate(`/edit/${id}`);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div className="profileTitle">Recent Listings</div>

        {loading ? (
          <p className="centerText">Loading listings…</p>
        ) : recentListings.length === 0 ? (
          <p className="centerText">No recent listings available!</p>
        ) : (
          <Swiper
            modules={[Navigation, SwiperPagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView="auto"
            className="dashboard-swiper"
          >
            {recentListings.map(item => (
              <SwiperSlide key={item.id} className="listingCard">
                <ListingCard
                  item={item}
                  currentUserId={currentUserId}
                  isLiked={!!likedMap[item.id]}
                  onToggleLike={handleToggleLike}
                  onBidClick={handleBidClick}
                  onEditClick={handleEditClick}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
