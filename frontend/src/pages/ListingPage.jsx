import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const ListingPage = () => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId"); 

  // get all categories for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Filter listings based on search and category
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("q", searchTerm.trim());
        if (selectedCategory) params.append("category", selectedCategory);

        const res = await fetch(`/api/listings?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setListings(data.listings);
          setPage(1); // Reset pagination
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      }
    };

    fetchListings();
  }, [searchTerm, selectedCategory]);

  const paginated = listings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        ← Back
      </button>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📋 All Auction Listings</h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px", width: "250px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {paginated.length === 0 ? (
        <p style={{ textAlign: "center" }}>No listings found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}
        >
          {paginated.map((item) => {
            const isOwner = String(item.owner_id) === String(currentUserId); // 注意类型一致
            return (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9"
                }}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p><strong>Min Bid:</strong> ${item.min_bid}</p>
                <p><strong>Ends:</strong> {new Date(item.end_date).toLocaleString()}</p>

                {isOwner ? (
                  <button
                    onClick={() => navigate(`/edit/${item.id}`)}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#ffc107",
                      color: "#333",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                  ✏️ Edit
                  </button>
                  ) : (
                  <button
                    onClick={() => handleBidClick(item.id)}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                  💰 Bid
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {listings.length > ITEMS_PER_PAGE && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ◀ Prev
          </button>
          <span>
            Page {page} of {Math.ceil(listings.length / ITEMS_PER_PAGE)}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(Math.ceil(listings.length / ITEMS_PER_PAGE), p + 1))
            }
            disabled={page === Math.ceil(listings.length / ITEMS_PER_PAGE)}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingPage;
