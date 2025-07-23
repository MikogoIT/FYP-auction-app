// src/pages/MyListings.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import ListingGrid from "../components/ListingGrid";

const ITEMS_PER_PAGE = 12;

export default function MyListings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const yellow = theme.palette.warning.light;
  const contrastText = theme.palette.getContrastText(yellow);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch my listings + their images
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/mylistings", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const enriched = await Promise.all(
          data.listings.map(async (item) => {
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

        setListings(enriched);
      } catch (err) {
        console.error("Failed to fetch my listings:", err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentUserId = Number(localStorage.getItem("userId"));
  const handleEdit = (id) => navigate(`/edit/${id}`);
  const handleBidClick = (id) => navigate(`/bid/${id}`);
  const handleToggleLike = () => {
    /* no-op for own listings */
  };

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* Toggle Buttons */}
        <div
          className="toggleButtons"
          style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/mylistings")}
            sx={{
              borderRadius: "999px",
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              '&:hover': { borderColor: 'primary.dark' },
              fontSize: "16px",
            }}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/mylistings/MyListingsBids")}
            sx={{
              borderRadius: "999px",
              borderColor: "grey.400",
              color: "grey.500",
              textTransform: "none",
              '&:hover': { borderColor: 'grey.600' },
              fontSize: "16px",
            }}
          >
            Bids On My Listings
          </Button>
        </div>

        <div id="wideTitle" className="profileTitle">
          My Listings
        </div>

        {loading ? (
          <p className="centerText">Loading…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t listed any items yet.</p>
        ) : (
          <ListingGrid
            listings={listings}
            itemsPerPage={ITEMS_PER_PAGE}
            currentUserId={currentUserId}
            likedMap={{}}
            onToggleLike={handleToggleLike}
            onBidClick={handleBidClick}
            onEditClick={handleEdit}
          />
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
