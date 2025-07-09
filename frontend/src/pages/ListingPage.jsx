// src/pages/ListingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTheme } from "@mui/material/styles";
import { Box, Pagination } from '@mui/material';

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const ITEMS_PER_PAGE = 6;

export default function ListingPage() {
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("userId"));

  const theme = useTheme();
  const yellow = theme.palette.warning.light;
  const contrastText = theme.palette.getContrastText(yellow);

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // track which listings are liked
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/watchlist/");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");
        const map = {};
        data.forEach((item) => {
          map[item.auction_id] = true;
        });
        setLikedMap(map);
      } catch (err) {
        console.error("Could not load watchlist:", err);
      }
    })();
  }, []);

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

  const handleToggleLike = async (listingId) => {
    const isLiked = !!likedMap[listingId];
    const url = isLiked
      ? "/api/watchlist/remove"
      : "/api/watchlist/add";
    const method = isLiked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: listingId }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `${method} ${url} failed`);
      }

      setLikedMap((m) => ({ ...m, [listingId]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = (id) => navigate(`/bid/${id}`);

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div id="wideTitle" className="profileTitle">All Auction Listings</div>

        <div className="filterContainer">
          <input
            className="searchInput"
            type="text"
            placeholder="🔍 Search by title or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                      <strong>Ends:</strong>{' '}
                      {new Date(item.end_date).toLocaleString("en-SG")}
                    </p>
                    <p>
                      <strong>Current Bid:</strong>{' '}
                      {item.current_bid != null
                        ? `$${item.current_bid}`
                        : "No bids yet"}
                    </p>
                  </div>
                  <div className="listingAction">
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

                    {isOwner ? (
                      <md-filled-button
                        onClick={() => navigate(`/edit/${item.id}`)}
                        style={{
                          flexGrow: 1,
                          "--md-sys-color-primary": yellow,
                          "--md-sys-color-on-primary": contrastText,
                        }}
                      >
                        Edit
                      </md-filled-button>
                    ) : (
                      <md-filled-button
                        onClick={() => handleBidClick(item.id)}
                        style={{ flexGrow: 1 }}
                      >
                        Bid
                      </md-filled-button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
