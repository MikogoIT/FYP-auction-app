// src/pages/ListingsResultPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import TelegramFollowButton from "../components/TelegramFollowButton";
import ListingGrid from "../components/ListingGrid";

const ITEMS_PER_PAGE = 6;

export default function ListingsResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("q") || "";
  const selectedCategory = query.get("category") || "";

  const currentUserId = Number(localStorage.getItem("userId"));
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Load watchlist to know which items are liked
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/watchlist/");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");
        const map = {};
        data.forEach(item => {
          map[item.auction_id] = true;
        });
        setLikedMap(map);
      } catch (err) {
        console.error("Could not load watchlist:", err);
      }
    })();
  }, []);

  // Load listings (with optional search/category) and enrich with image_url
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
          data.listings.map(async item => {
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
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm, selectedCategory]);

  // Load categories for display
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  const handleToggleLike = async listingId => {
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
      setLikedMap(m => ({ ...m, [listingId]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = id => navigate(`/bid/${id}`);
  const handleEditClick = id => navigate(`/edit/${id}`);

  const selectedCategoryName =
    selectedCategory &&
    categories.find(cat => String(cat.id) === selectedCategory)?.name;

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
                {searchTerm ? ` matching “${searchTerm}”` : ""}
              </div>
            )}
            {!selectedCategoryName && searchTerm && (
              <div>Showing results matching: “{searchTerm}”</div>
            )}
          </div>
          {selectedCategoryName && (
            <TelegramFollowButton category={selectedCategoryName} />
          )}
        </div>

        {loading ? (
          <p className="centerText">Loading listings…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">No listings found.</p>
        ) : (
          <ListingGrid
            listings={listings}
            itemsPerPage={ITEMS_PER_PAGE}
            currentUserId={currentUserId}
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
