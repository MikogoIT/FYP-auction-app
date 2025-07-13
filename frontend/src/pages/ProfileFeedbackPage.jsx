// src/pages/ProfileFeedbackPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Material Web Components
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// Example reviews data (replace with your real data source)
const mockReviews = [
  {
    id: 1,
    reviewer: "Jane Doe",
    role: "Buyer",
    rating: 5,
    date: "2025-06-10",
    text: "Excellent transaction, very responsive!",
  },
  {
    id: 2,
    reviewer: "John Smith",
    role: "Seller",
    rating: 4,
    date: "2025-05-22",
    text: "Smooth deal, prompt payment, recommended.",
  },
  {
    id: 3,
    reviewer: "Alice Lee",
    role: "Buyer",
    rating: 3,
    date: "2025-04-30",
    text: "Communication was okay, but delivery was delayed.",
  },
];

// Helper for star rating
function StarRating({ rating }) {
  return (
    <span>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ProfileFeedbackPage() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  // Filter reviews
  const filteredReviews =
    filter === "All"
      ? mockReviews
      : mockReviews.filter((r) => r.role === filter.slice(0, -1));

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === "Newest") return new Date(b.date) - new Date(a.date);
    if (sort === "Oldest") return new Date(a.date) - new Date(b.date);
    if (sort === "Highest Rating") return b.rating - a.rating;
    if (sort === "Lowest Rating") return a.rating - b.rating;
    return 0;
  });

  // Example stats (replace with real data)
  const ratingScore = 4.8;
  const numReviews = mockReviews.length;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">

        {/* Profile & Ratings Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {/* Avatar */}
          <img
            src="https://api.dicebear.com/7.x/personas/svg?seed=User"
            alt="User Avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              marginRight: 24,
              border: "2px solid #eee",
            }}
          />
          {/* Ratings */}
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              <StarRating rating={Math.round(ratingScore)} /> {ratingScore}/5
            </div>
            <div style={{ color: "#888" }}>{numReviews} Reviews</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          {/* Filters */}
          <div>
            <md-filled-button
              onClick={() => setFilter("All")}
              style={{ marginRight: 8 }}
              selected={filter === "All" ? "true" : undefined}
            >
              All Reviews
            </md-filled-button>
            <md-filled-tonal-button
              onClick={() => setFilter("Buyers")}
              style={{ marginRight: 8 }}
              selected={filter === "Buyers" ? "true" : undefined}
            >
              From Buyers
            </md-filled-tonal-button>
            <md-filled-tonal-button
              onClick={() => setFilter("Sellers")}
              selected={filter === "Sellers" ? "true" : undefined}
            >
              From Sellers
            </md-filled-tonal-button>
          </div>
          {/* Sorting */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          {sortedReviews.length === 0 ? (
            <div style={{ color: "#888", padding: 32, textAlign: "center" }}>
              No reviews to display.
            </div>
          ) : (
            sortedReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 16,
                  background: "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{review.reviewer}</strong> <span style={{ color: "#888" }}>({review.role})</span>
                  </div>
                  <div>
                    <StarRating rating={review.rating} />{" "}
                    <span style={{ color: "#888", fontSize: 14 }}>{review.date}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>{review.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
