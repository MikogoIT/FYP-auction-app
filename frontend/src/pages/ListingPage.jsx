// src/pages/ListingPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import IconButton from "@mui/material/IconButton";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const ITEMS_PER_PAGE = 6;

export default function ListingPage() {
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("userId"));

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // track liked state per listingId
  const [likedMap, setLikedMap] = useState({});

  // 1) On mount, fetch your watchlist to know which IDs are already liked
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/watchlist/?buyerId=${currentUserId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Watchlist load failed");
        // data: [ { auction_id: 7, … }, … ]
        const map = {};
        data.forEach((item) => {
          map[item.auction_id] = true;
        });
        setLikedMap(map);
      } catch (err) {
        console.error("Could not load watchlist:", err);
      }
    })();
  }, [currentUserId]);

  // 2) Fetch listings + images
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("q", searchTerm.trim());
        if (selectedCategory) params.append("category", selectedCategory);

        const res = await fetch(`/api/listings?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const enriched = await Promise.all(
          data.listings.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${item.id}`
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
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm, selectedCategory]);

  // 3) Toggle handler (add or remove)
  const handleToggleLike = async (listingId) => {
    const isLiked = !!likedMap[listingId];
    const url = isLiked ? "/api/watchlist/remove" : "/api/watchlist/add";
    const method    = isLiked ? "DELETE" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUserId,
          auctionId: listingId,
        }),
      });
      if (!res.ok) throw new Error(`${method} ${url} failed`);
      setLikedMap((m) => ({ ...m, [listingId]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = (id) => navigate(`/bid/${id}`);

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
        <div className="profileTitle">📋 All Auction Listings</div>

        {/* filters */}
        <div className="filterContainer">
          <input
            className="searchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search by title or description…"
          />
          <select
            className="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="centerText">Loading listings…</p>
        ) : paginated.length === 0 ? (
          <p className="centerText">No listings found.</p>
        ) : (
          <div className="listingGrid">
            {paginated.map((item) => {
              const isOwner = item.seller_id === currentUserId;
              return (
                <div key={item.id} className="listingCard">
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

                    <div
                      className="listingAction"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* Toggle heart */}
                      <IconButton
                        onClick={() => handleToggleLike(item.id)}
                        size="large"
                      >
                        {likedMap[item.id] ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>

                      {/* Bid or Edit */}
                      {isOwner ? (
                        <md-filled-button
                          onClick={() => navigate(`/edit/${item.id}`)}
                          style={{ flexGrow: 1 }}
                        >
                          ✏️ Edit
                        </md-filled-button>
                      ) : (
                        <md-filled-button
                          onClick={() => handleBidClick(item.id)}
                          style={{ flexGrow: 1 }}
                        >
                          💰 Bid
                        </md-filled-button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* pagination */}
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
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
