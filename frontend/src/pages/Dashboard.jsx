// src/pages/Dashboard.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Material-Web tabs
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = useRef(null);

  // map URL → tab index
  const pathToIdx = (p) =>
    p === "/ListingPage" ? 1 : p === "/mylistings" ? 2 : 0;

  const [tabIndex, setTabIndex] = useState(pathToIdx(location.pathname));

  // keep tabIndex in sync with URL (back/forward buttons, etc.)
  useEffect(() => {
    setTabIndex(pathToIdx(location.pathname));
  }, [location.pathname]);

  // when user clicks a tab, navigate
  useEffect(() => {
    const tabsEl = tabsRef.current;
    if (!tabsEl) return;
    const onChange = () => {
      const i = tabsEl.activeTabIndex;
      if (i === 0) navigate("/dashboard");
      else if (i === 1) navigate("/ListingPage");
      else if (i === 2) navigate("/mylistings");
    };
    tabsEl.addEventListener("change", onChange);
    return () => tabsEl.removeEventListener("change", onChange);
  }, [navigate]);

  // fetch recent listings…
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error();
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
      } catch (e) {
        console.error(e);
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
      {/* Tabs container */}
      <div style={{ marginBottom: 16 }}>
        <md-tabs
          ref={tabsRef}
          activeTabIndex={tabIndex}
          style={{
            display: "inline-flex",                    // only as wide as content
            "--md-primary-tab-container-color": "transparent",   // no pill BG
            "--md-primary-tab-container-shape": "0px",           // no rounding
            "--md-primary-tab-active-indicator-color": "#B58392",// underline color
            "--md-primary-tab-active-indicator-height": "2px",   // underline thickness
          }}
        >
          <md-primary-tab
            style={{
              "--md-primary-tab-label-text-font": "16px",
              padding: "0 10px",
            }}
          >
            recent listings
          </md-primary-tab>
          <md-primary-tab
            style={{
              "--md-primary-tab-label-text-font": "16px",
              padding: "0 10px",
            }}
          >
            all listings
          </md-primary-tab>
          <md-primary-tab
            style={{
              "--md-primary-tab-label-text-font": "16px",
              padding: "0 10px",
            }}
          >
            my listings
          </md-primary-tab>
        </md-tabs>
      </div>

      <div className="profileTitle">Recent Listings</div>

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
                      <h3 style={{ margin: 0, marginBottom: 8 }}>
                        {item.title}
                      </h3>
                      <p style={{ margin: "4px 0", color: "#555" }}>
                        {item.description}
                      </p>
                      {/* …other fields… */}
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

// ─── Styles ─────────────────────────────────────────────────

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
