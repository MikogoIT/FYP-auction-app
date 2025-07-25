import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Rating,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';


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
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFeedback(userId) {
      setLoading(true);
      try {
        // Fetch User Profile
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);

        // Fetch User Profile Ratings
        const ratingRes = await fetch(`/api/feedback/ratings/${userId}`);
        const ratingData = await ratingRes.json();
        if (!ratingRes.ok) throw new Error(ratingData.message);
        setRatingInfo(ratingData);

        // Fetch Reviews
        const fbRes = await fetch(`/api/feedback/user/${userId}`);
        const fbData = await fbRes.json();
        if (!fbRes.ok) throw new Error(fbData.message);
        setReviews(fbData);

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

  // Filter & sort logic
  const filteredReviews =
    filter === "All"
      ? reviews
      : reviews.filter((r) => r.author_role === filter.slice(0, -1));
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === "Newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sort === "Oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sort === "Highest Rating") return b.user_ratings - a.user_ratings;
    if (sort === "Lowest Rating") return a.user_ratings - b.user_ratings;
    return 0;
  });
  const ratingScore = ratingInfo?.avg_rating ?? "N/A";
  const numReviews = ratingInfo?.total_reviews ?? 0;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        {/* Custom breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{
          // make all links and the final Typography 16px
          '& a, & .MuiTypography-root': {
            fontSize: '16px',
          }
        }}>
          <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <MuiLink
            component={RouterLink}
            to={`/feedback/${userId}`}
            underline="hover"
            color="inherit"
          >
            Public Profile
          </MuiLink>
          <Typography color="text.primary">{user?.username}</Typography>
        </Breadcrumbs>

        {/* Toggle between public profile / account settings */}
        <div
          className="toggleButtons"
          style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%" }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/feedback/${userId}")}
            sx={{
              borderRadius: "999px",
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              "&:hover": { borderColor: "primary.dark" },
              fontSize: "16px",
            }}
          >
            Public Profile
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/profile")}
            sx={{
              borderRadius: "999px",
              borderColor: "grey.400",
              color: "grey.500",
              textTransform: "none",
              "&:hover": { borderColor: "grey.600" },
              fontSize: "16px",
            }}
          >
            Account Settings
          </Button>
        </div>

        <div className="profileTitle">{user?.username}'s Profile</div>

        {/* Profile Header */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <Avatar
            src={user?.profile_image_url || undefined}
            alt={user?.username || "User"}
            style={{ width: 80, height: 80, marginRight: 24, backgroundColor: "#fff", border: "2px solid #eee" }}
          >
            {!user?.profile_image_url && <PersonIcon />}
          </Avatar>

          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <StarRating
                rating={ratingInfo?.avg_rating ? Math.round(ratingInfo.avg_rating) : 0}
                size="large"
              />
              <div style={{ marginLeft: 8, color: "#222", fontWeight: 600 }}>
                {ratingScore !== "N/A" ? Number(ratingScore).toFixed(1) : "N/A"}
              </div>
            </div>
            <div style={{ color: "#666", fontSize: 16 }}>
              {numReviews} Review{numReviews !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div>{user?.email || undefined}</div>
        {/* Reviews List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={3}>
            {sortedReviews.length === 0 ? (
              <Grid item xs={12}>
                <div style={{ color: "#888", padding: 32, textAlign: "center" }}>
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
                            src={author?.profile_image_url || undefined}
                            alt={author?.username || "User"}
                          >
                            {!author?.profile_image_url && <PersonIcon />}
                          </Avatar>
                        }
                        title={
                          <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {author?.username || "User"}
                            <span style={{ marginLeft: 8, fontSize: 14, color: "#666" }}>
                              ({review.author_role})
                            </span>
                          </div>
                        }
                        subheader={
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <StarRating rating={review.user_ratings} size="small" />
                            <div style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        }
                      />
                      <CardContent>
                        <div style={{ fontSize: 14 }}>{review.user_comments}</div>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
