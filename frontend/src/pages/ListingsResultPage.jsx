// src/pages/ListingsResultPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTheme } from "@mui/material/styles";
import { Box, Pagination } from "@mui/material";

import TelegramFollowButton from "../components/TelegramFollowButton";
import BreadcrumbsNav from "../components/BreadcrumbsNav";


const ITEMS_PER_PAGE = 6;

export default function ListingsResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const searchTerm = query.get("q") || "";
    const selectedCategory = query.get("category") || "";

    const theme = useTheme();
    const yellow = theme.palette.warning.light;
    const contrastText = theme.palette.getContrastText(yellow);

    const currentUserId = Number(localStorage.getItem("userId"));

    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [likedMap, setLikedMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

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
                console.error("Could not load watchlist: ", err);
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
                            const imgRes = await fetch(`/api/listingimg?listingId=${item.id}`);
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
                console.error("Failed to fetch listings: ", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [searchTerm, selectedCategory]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setCategories(data.categories);
            } catch (err) {
                console.error("Failed to load categories: ", err);
            }
        })();
    }, []);

    const handleToggleLike = async (listingId) => {
        const isLiked = !!likedMap[listingId];
        const url = isLiked ? "/api/watchlist/remove" : "/api/watchlist/add";
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
            console.error("Error toggling watchlist: ", err);
        }
    };

    const handleBidClick = (id) => navigate(`/bid/${id}`);

    const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
    const paginated = listings.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const selectedCategoryName =
        selectedCategory &&
        categories.find((cat) => String(cat.id) === String(selectedCategory))?.name;
// 
    return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />
        <div className="titleWithTele">
            <div>
                {selectedCategoryName && (
                    <div>
                        Showing results for category: <em>{selectedCategoryName}</em>
                        {searchTerm ? ` matching "${searchTerm}"`: ""}
                    </div>
                )}
                {!selectedCategoryName && searchTerm && (
                    <div>Showing results matching: "{searchTerm}"</div>
                )}
            </div>

            {selectedCategoryName && (
                <TelegramFollowButton category={selectedCategoryName} />
            )}

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
                          sx={{
                            width: "100%",
                            height: 200,
                            bgcolor: "#eee",
                        }}> 
                          <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                    </Avatar>
                  )}

                  <div className="listingDetails">
                    <div className="listingTitle">{item.title}</div>
                    <p className="listingDesc">{item.description}</p>
                    <p className="listingMinBid">
                      <strong>Min Bid:</strong> ${item.min_bid}
                    </p>
                    <p className="listingEndDate">
                      <strong>Ends:</strong>{" "}
                      {new Date(item.end_date).toLocaleString("en-SG")}
                    </p>
                    <p>
                      <strong>Current Bid:</strong>{" "}
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