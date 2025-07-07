// src/pages/WatchedListings.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const ITEMS_PER_PAGE = 6;

export default function WatchedListings() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch watchlist and enrich with image_url
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // assumes your API uses session to identify buyer,
        // otherwise append `?buyerId=${currentUserId}`
        const res = await fetch("/api/watchlist/");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");

        // data is an array of { auction_id, title, description, min_bid, end_date, ... }
        const enriched = await Promise.all(
          data.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.auction_id)}`
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
        setPage(1);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUserId]);

  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);

  const handleBidClick = (auctionId) => {
    navigate(`/bid/${auctionId}`);
  };

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div className="profileTitle">❤️ Liked Listings</div>

        {loading ? (
          <p className="centerText">Loading your liked listings…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t liked any listings yet.</p>
        ) : (
          <>
            <div className="listingGrid">
              {paginated.map((item) => (
                <div key={item.auction_id} className="listingCard">
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
                    <h3 className="listingTitle">{item.title}</h3>
                    <p className="listingDesc">{item.description}</p>
                    <p className="listingMinBid">
                      <strong>Min Bid:</strong> ${item.min_bid}
                    </p>
                    <p className="listingEndDate">
                      <strong>Ends:</strong>{" "}
                      {new Date(item.end_date).toLocaleString()}
                    </p>
                    <p>
                      <strong>Current Bid:</strong>{" "}
                      {item.current_bid != null
                        ? `$${item.current_bid}`
                        : "No bids yet"}
                    </p>

                    <div className="listingAction">
                      <md-filled-button
                        onClick={() => handleBidClick(item.auction_id)}
                        style={{ width: "100%" }}
                      >
                        💰 Bid
                      </md-filled-button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="paginationControls">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ◀ Prev
                </button>
                <span className="pageIndicator">
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
