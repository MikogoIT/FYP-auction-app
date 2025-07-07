// src/pages/WatchedListings.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteIcon from "@mui/icons-material/Favorite";

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const ITEMS_PER_PAGE = 12;  // still 12 per page

export default function WatchedListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch watchlist + images
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

  // Remove from watchlist
  const handleRemoveLike = async (auctionId) => {
    try {
      const res = await fetch("/api/watchlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: auctionId }),
      });
      if (!res.ok) throw new Error("Failed to remove from watchlist");
      setListings((lst) => lst.filter((item) => item.auction_id !== auctionId));
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  const handleBidClick = (auctionId) => navigate(`/bid/${auctionId}`);

  // pagination
  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <h2 className="profileTitle">Liked Listings</h2>

        {loading ? (
          <p className="centerText">Loading your liked listings…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t liked any listings yet.</p>
        ) : (
          <>
            <div
              className="listingGrid"
    
            >
              {paginated.map((item) => (
                <div
                  key={item.auction_id}
                  className="listingCard"
      
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="listingImage"
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
                    <h3 className="listingTitle">
                      {item.title}
                    </h3>
                    <p className="listingCat" >
                      <strong>Category:</strong> {item.category_name || "—"}
                    </p>
                    <p className="listingDesc" >
                      {item.description}
                    </p>
                    <p >
                      <strong>Min Bid:</strong> ${item.min_bid}
                    </p>
                    <p >
                      <strong>Ends:</strong>{" "}
                      {new Date(item.end_date).toLocaleString()}
                    </p>
                    <p >
                      <strong>Current Bid:</strong>{" "}
                      {item.current_bid != null
                        ? `$${item.current_bid}`
                        : "No bids yet"}
                    </p>
                  </div>

                  <div className="listingAction">
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
              ))}
            </div>

            {totalPages > 1 && (
              <div  className="paginationControls">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ◀ Prev
                </button>
                <span  className="pageIndicator">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
