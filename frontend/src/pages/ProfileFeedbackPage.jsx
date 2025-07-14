// src/pages/ProfileFeedbackPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Rating,
  CircularProgress,
} from "@mui/material";
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
        //console.log("Fetched user:", userData);

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
  const hasReviews = reviews.length > 0;
  const ratingScore = hasReviews
    ? (
        reviews.reduce((sum, r) => sum + r.user_ratings, 0) / reviews.length
      ).toFixed(2)
    : "N/A";
  const numReviews = reviews.length;

  return (
    <Box
      className="dashboardCanvas"
      sx={{ p: 2, bgcolor: "#f8f8f8", minHeight: "100vh" }}
    >
      <Box className="sidebarSpacer" />
      <Box className="dashboardContent" sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Profile Name and Ratings Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            id="middleTitle"
            className="profileTitle"
            variant="h5"
            fontWeight={700}
            sx={{ mb: 0.5 }}
          >
            {user?.username}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={user?.profile_image_url || undefined}
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                border: "2px solid #eee",
                bgcolor: "#fff",
              }}
              alt="User Avatar"
            />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <StarRating
                  rating={hasReviews ? Math.round(ratingScore) : 0}
                  size="large"
                />
                <Typography sx={{ ml: 1, color: "#222", fontWeight: 600 }}>
                  {hasReviews ? Number(ratingScore).toFixed(1) : "N/A"}
                </Typography>
              </Box>
              <Typography color="text.secondary" fontSize={16}>
                {numReviews} Reviews
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filters and Sorting */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
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
          </Box>
          <Box>
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
          </Box>
        </Box>

        {/* Reviews List */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedReviews.length === 0 ? (
              <Grid item xs={12}>
                <Box color="#888" p={4} textAlign="center">
                  No reviews to display.
                </Box>
              </Grid>
            ) : (
              sortedReviews.map((review) => {
                const author = authorInfo[review.author_id];
                return (
                  <Grid item xs={12} sm={6} md={4} key={review.id}>
                    <Card variant="outlined" sx={{ bgcolor: "#fafafa" }}>
                      <CardHeader
                        avatar={
                          <Avatar
                            src={author?.profile_image_url}
                            alt={author?.username || "User"}
                          />
                        }
                        title={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {author?.username || "User"}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              ({review.author_role})
                            </Typography>
                          </Typography>
                        }
                        subheader={
                          <Box display="flex" alignItems="center">
                            <StarRating
                              rating={review.user_ratings}
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2">
                          {review.user_comments}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}
