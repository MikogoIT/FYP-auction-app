// src/pages/WatchedListings.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import ListingGrid from "../components/ListingGrid";

const ITEMS_PER_PAGE = 12;

export default function WatchedListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});

  // Fetch watchlist + enrich with images
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist/", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");

        const map = {};
        const enriched = await Promise.all(
          data.map(async (item) => {
            map[item.auction_id] = true;
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.auction_id)}`
              );
              const { imageUrl } = await imgRes.json();
              return { ...item, image_url: imageUrl };
            } catch {
              return { ...item, image_url: null };
            }
          })
        );

        setListings(enriched);
        setLikedMap(map);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Remove from watchlist
  const handleToggleLike = async (auctionId) => {
    try {
      const res = await fetch("/api/watchlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: auctionId }),
      });
      if (!res.ok) throw new Error("Failed to remove from watchlist");

      setListings((lst) => lst.filter((item) => item.auction_id !== auctionId));
      setLikedMap((m) => {
        const copy = { ...m };
        delete copy[auctionId];
        return copy;
      });
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = (auctionId) => navigate(`/bid/${auctionId}`);
  const handleEditClick = (auctionId) => navigate(`/edit/${auctionId}`);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />
        <div id="wideTitle" className="profileTitle">
          Liked Listings
        </div>

        {loading ? (
          <p className="centerText">Loading your liked listings…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t liked any listings yet.</p>
        ) : (
          <ListingGrid
            listings={listings}
            itemsPerPage={ITEMS_PER_PAGE}
            currentUserId={Number(localStorage.getItem("userId"))}
            likedMap={likedMap}
            onToggleLike={handleToggleLike}
            onBidClick={handleBidClick}
            onEditClick={handleEditClick}
          />
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
