// src/pages/ListingPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingTabs from "../components/ListingTabs";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Material-Web buttons
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";



const ITEMS_PER_PAGE = 6;

export default function ListingPage() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    })();
  }, []);

  // Fetch listings + enrich with image_url
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
        setPage(1);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm, selectedCategory]);

  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);

  const handleBidClick = (id) => navigate(`/bid/${id}`);

  return (
    <div className="dashboardCanvas listingPageContainer">
      <ListingTabs />

      <div className="profileTitle">📋 All Auction Listings</div>

      <div className="filterContainer">
        <input
          className="searchInput"
          type="text"
          placeholder="🔍 Search by title or description..."
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
            const isOwner = String(item.seller_id) === String(currentUserId);
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
                  <div className="listingAction">
                    {isOwner ? (
                      <md-filled-button
                        onClick={() => navigate(`/edit/${item.id}`)}
                        style={{ width: "100%" }}
                      >
                        ✏️ Edit
                      </md-filled-button>
                    ) : (
                      <md-filled-button
                        onClick={() => handleBidClick(item.id)}
                        style={{ width: "100%" }}
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
  );
}
