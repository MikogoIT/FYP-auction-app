// src/pages/ProfileFeedbackPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

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
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [usernames, setUsernames] = useState({}); // Map of userId -> username

  useEffect(() => {
    console.log("Effect runs when userId changes:", userId);
    async function fetchFeedback(userId) {
      try {
        // Fetch User Profile
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);
        console.log("Fetched user:", userData);

        // Fetch reviews
        const fbRes = await fetch(`/api/feedback/user/${userId}`);
        const fbData = await fbRes.json();
        if (!fbRes.ok) throw new Error(fbData.message);
        setReviews(fbData);
        console.log("Fetched reviews:", fbData);

        // Get unique author IDs
        //const authorIds = [...new Set(fbData.map(r => r.author_id))];


        
      } catch (err) {
        console.error("Failed to load Reviews:", err);
        console.error("Failed to load Profile:", err);
      }
    }
    if (userId) {
      fetchFeedback(userId);
    }
  }, [userId]);

  /* Old Code
  if (userId) {
    // Fetch another user's profile and feedback
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        console.log("Fetched user:", data);
      });

    fetch(`/api/feedback/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        console.log("Fetched reviews:", data);
      });
  } else {
    // Fetch your own profile, photo, and feedback
    async function fetchProfile() {
      const [pRes, phRes] = await Promise.all([
        fetch("/api/profile", { credentials: "include" }),
        fetch("/api/displayPhoto", { credentials: "include" })
      ]);
      const pData = await pRes.json();
      const phData = await phRes.json();
      const merged = { ...pData.user, profile_image_url: phData.profile_image_url };
      setUser(merged);
      console.log("Merged user:", merged);

      // Fetch your own feedback
      const fbRes = await fetch(`/api/feedback/user/${pData.user.id}`);
      const fbData = await fbRes.json();
      setReviews(fbData);
      console.log("Fetched own reviews:", fbData);
    }
    fetchProfile(); */

  // Filter reviews
  const filteredReviews =
    filter === "All"
      ? reviews
      : reviews.filter((r) => r.author_role === filter.slice(0, -1));

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === "Newest")
      return new Date(b.created_at) - new Date(a.created_at);
    if (sort === "Oldest")
      return new Date(a.created_at) - new Date(b.created_at);
    if (sort === "Highest Rating") return b.user_ratings - a.user_ratings;
    if (sort === "Lowest Rating") return a.user_ratings - b.user_ratings;
    return 0;
  });

  // Calculate average rating
  const ratingScore = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + r.user_ratings, 0) / reviews.length
      ).toFixed(2)
    : "N/A";
  const numReviews = reviews.length;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        {/* Profile Name and Ratings Header */}
        <div style={{ marginBottom: 16 }}>
          <div
            id="middleTitle"
            className="profileTitle"
            style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}
          >
            Hello,
            <br />
            {user?.username}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Avatar */}
            <Avatar
              src={user?.profile_image_url || undefined}
              sx={{ width: 120, height: 120 }}
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
        </div>

        {/* Filters and Sorting */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
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
                marginLeft: 5,
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
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <strong>{review.author_name || "User"}</strong>{" "}
                    <span style={{ color: "#888" }}>
                      ({review.author_role})
                    </span>
                  </div>
                  <div>
                    <StarRating rating={review.user_ratings} />{" "}
                    <span style={{ color: "#888", fontSize: 14 }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>{review.user_comments}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
