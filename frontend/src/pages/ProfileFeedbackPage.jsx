// src/pages/Template.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Rating,
  CircularProgress,
} from "@mui/material";

import BreadcrumbsNav from "../components/BreadcrumbsNav";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// Helper for star rating (using MUI's Rating for consistency)
function StarRating({ rating, size = "medium", readOnly = true }) {
  return (
    <Rating
      value={rating}
      max={5}
      readOnly={readOnly}
      size={size}
      precision={1}
      sx={{ color: "#f5a623" }}
    />
  );
}


export default function ProfileFeedbackPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [authorInfo, setAuthorInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedback(userId) {
      setLoading(true);
      try {
        // Fetch User Profile
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);
       // console.log("Fetched user:", userData);

        // Fetch User Profile Ratings
        const ratingRes = await fetch(`/api/feedback/ratings/${userId}`);
        const ratingData = await ratingRes.json();
        if (!ratingRes.ok) throw new Error(ratingData.message);
        setRatingInfo(ratingData);
        //console.log("Fetched user:", ratingData);

        // Fetch Reviews
        const fbRes = await fetch(`/api/feedback/user/${userId}`);
        const fbData = await fbRes.json();
        if (!fbRes.ok) throw new Error(fbData.message);
        setReviews(fbData);
        //console.log("Fetched reviews:", fbData);

        // Fetch Author Review Info
        const authorIds = [...new Set(fbData.map((r) => r.author_id))];
        const authorInfoEntries = await Promise.all(
          authorIds.map(async (id) => {
            const res = await fetch(`/api/users/${id}`);
            const data = await res.json();
            return [id, data];
          }),
        );
        setAuthorInfo(Object.fromEntries(authorInfoEntries));
        //console.log("Unique author IDs:", authorIds);
      } catch (err) {
        console.error("Failed to load Page:", err);
        setUser(null);
        setRatingInfo(null);
        setReviews([]);
        setAuthorInfo({});
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchFeedback(userId);
    }
  }, [userId]);

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
  const ratingScore = ratingInfo?.avg_rating ?? "N/A";
  const numReviews = ratingInfo?.total_reviews ?? 0;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />
        {/* page title */}
        <div className="profileTitle">{user?.username}'s Profile</div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px" /* mb:2 equivalent */,
            }}
            >
            <Avatar
                src={user?.profile_image_url || undefined}
                alt="User Avatar"
                style={{
                width: 80,
                height: 80,
                marginRight: 24 /* mr:3 */,
                border: "2px solid #eee",
                backgroundColor: "#fff",
                }}
            />

            <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                <StarRating
                    rating={
                    ratingInfo?.avg_rating
                        ? Math.round(ratingInfo.avg_rating)
                        : 0
                    }
                    size="large"
                />
                <div
                    style={{
                    marginLeft: 8, /* ml:1 */
                    color: "#222",
                    fontWeight: 600,
                    }}
                >
                    {ratingScore !== "N/A"
                    ? Number(ratingScore).toFixed(1)
                    : "N/A"}
                </div>
                </div>

                <div
                style={{
                    color: "#666" /* approximate text.secondary */,
                    fontSize: 16,
                }}
                >
                {numReviews} Review{numReviews !== 1 ? "s" : ""}
                </div>
            </div>
        </div>

        {/* Filters and Sorting */}
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px" /* mb:3 */,
            }}
        >
            <div>
                <md-filled-button
                onClick={() => setFilter("All")}
                style={{ marginRight: "8px" }}
                selected={filter === "All" ? "true" : undefined}
                >
                All Reviews
                </md-filled-button>
                <md-filled-tonal-button
                onClick={() => setFilter("Buyers")}
                style={{ marginRight: "8px" }}
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

            <div>
                <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    marginLeft: "5px",
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
        {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
            <CircularProgress />
        </div>
        ) : (
        <Grid container spacing={3}>
            {sortedReviews.length === 0 ? (
            <Grid item xs={12}>
                <div style={{ color: "#888", padding: "32px", textAlign: "center" }}>
                No reviews to display.
                </div>
            </Grid>
            ) : (
            sortedReviews.map((review) => {
                const author = authorInfo[review.author_id];
                return (
                <Grid item xs={12} sm={6} md={4} key={review.id}>
                    <Card variant="outlined" style={{ backgroundColor: "#fafafa" }}>
                    <CardHeader
                        avatar={
                        <Avatar
                            src={author?.profile_image_url}
                            alt={author?.username || "User"}
                        />
                        }
                        title={
                        <div style={{ fontSize: "16px", fontWeight: 600 }}>
                            {author?.username || "User"}
                            <span
                            style={{
                                marginLeft: "8px",
                                fontSize: "14px",
                                color: "#666",
                            }}
                            >
                            ({review.author_role})
                            </span>
                        </div>
                        }
                        subheader={
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <StarRating
                            rating={review.user_ratings}
                            size="small"
                            />
                            <div
                            style={{
                                marginLeft: "8px",
                                fontSize: "12px",
                                color: "#666",
                            }}
                            >
                            {new Date(review.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        }
                    />
                    <CardContent>
                        <div style={{ fontSize: "14px" }}>
                        {review.user_comments}
                        </div>
                    </CardContent>
                    </Card>
                </Grid>
                );
            })
            )}
        </Grid>
        )}



        
    
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}