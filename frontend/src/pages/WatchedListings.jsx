// src/pages/WatchedListings.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteIcon from "@mui/icons-material/Favorite";

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const ITEMS_PER_PAGE = 12;  // show up to 12 per page

export default function WatchedListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // 1) Fetch the watchlist and enrich with image_url
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist/");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");

        const enriched = await Promise.all(
          data.map(async (item) => {
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
        setPage(1);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Remove from watchlist (unlike)
  const handleRemoveLike = async (auctionId) => {
    try {
      const res = await fetch("/api/watchlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: auctionId }),
      });
      if (!res.ok) throw new Error("Failed to remove from watchlist");
      // remove the card from state
      setListings((lst) =>
        lst.filter((item) => item.auction_id !== auctionId)
      );
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  const handleBidClick = (auctionId) => {
    navigate(`/bid/${auctionId}`);
  };

  // pagination logic
  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <h2 className="profileTitle">❤️ Liked Listings</h2>

        {loading ? (
          <p className="centerText">Loading your liked listings…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t liked any listings yet.</p>
        ) : (
          <>
            <div
              className="listingGrid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, 300px)",
                justifyContent: "start",
                gap: "16px",
              }}
            >
              {paginated.map((item) => (
                <div
                  key={item.auction_id}
                  className="listingCard"
                >
                  {item.image_url ? (
                    <img
                      className="listingImage"
                      src={item.image_url}
                      alt={item.title}
                      
                    />
                  ) : (
                    <Avatar
                      variant="square"
                      sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                    </Avatar>
                  )}

                  <div className="listingDetails">
                    <h3 className="listingTitle" style={{ margin: "4px 0" }}>
                      {item.title}
                    </h3>

                    <p style={{ margin: "4px 0", fontSize: "16px" }}>
                    <strong>Category:</strong> {item.category_name || "—"}
                    </p>

                    <p
                      className="listingDesc"
                      style={{ margin: "4px 0", fontSize: "16px" }}
                    >
                      {item.description}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Min Bid:</strong> ${item.min_bid}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Ends:</strong>{" "}
                      {new Date(item.end_date).toLocaleString()}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Current Bid:</strong>{" "}
                      {item.current_bid != null
                        ? `$${item.current_bid}`
                        : "No bids yet"}
                    </p>

                    <div
                        className="listingAction"
                        style={{
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        }}
                    >
                        <IconButton
                        onClick={() => handleRemoveLike(item.auction_id)}
                        size="large"
                        >
                        <FavoriteIcon color="error" />
                        </IconButton>

                        <md-filled-button
                        onClick={() => handleBidClick(item.auction_id)}
                        style={{ flexGrow: 1 }}
                        >
                        Bid
                        </md-filled-button>
                    </div>
                  </div>

                  
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="paginationControls"
                style={{ marginTop: "16px" }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ◀ Prev
                </button>
                <span
                  className="pageIndicator"
                  style={{ margin: "0 12px" }}
                >
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
