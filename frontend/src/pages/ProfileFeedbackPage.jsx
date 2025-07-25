import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
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
import PersonIcon from "@mui/icons-material/Person";

// web components
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

function StarRating({ rating, size = "medium", readOnly = true }) {
  return (
    <Rating
      value={rating}
      readOnly={readOnly}
      size={size}
      precision={1}
      sx={{ color: "#f5a623" }}
    />
  );
}

export default function ProfileFeedbackPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [authorInfo, setAuthorInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true);
      try {
        // 1. Fetch user
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        console.log("⛑ userData:", userData);
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);

        // 2. Fetch rating
        const ratingRes = await fetch(`/api/feedback/ratings/${userId}`);
        const ratingData = await ratingRes.json();
        console.log("⭐ ratingData:", ratingData);
        if (!ratingRes.ok) throw new Error(ratingData.message);
        setRatingInfo(ratingData);

        // 3. Fetch reviews (with destructuring in case API wraps it)
        const fbRes = await fetch(`/api/feedback/user/${userId}`);
        const fbJson = await fbRes.json();
        console.log("📝 fbJson:", fbJson);
        if (!fbRes.ok) throw new Error(fbJson.message);
        // If your API returns { reviews: [...] } do:
        //   setReviews(fbJson.reviews || []);
        // Otherwise if it returns an array directly:
        setReviews(Array.isArray(fbJson) ? fbJson : fbJson.reviews || []);

        // 4. Fetch author info
        const authorIds = [...new Set((fbJson.reviews || fbJson).map(r => r.author_id))];
        console.log("👥 authorIds:", authorIds);
        const entries = await Promise.all(
          authorIds.map(async id => {
            const res = await fetch(`/api/users/${id}`);
            const data = await res.json();
            return [id, data];
          })
        );
        console.log("📇 authorInfoEntries:", entries);
        setAuthorInfo(Object.fromEntries(entries));
      } catch (err) {
        console.error("❌ Failed to load page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <CircularProgress />
      </div>
    );
  }

  const avgScore = ratingInfo?.avg_rating ?? 0;
  const reviewCount = ratingInfo?.total_reviews ?? 0;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        {/* Custom breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, "& a, & .MuiTypography-root": { fontSize: 16 } }}>
          <MuiLink component={RouterLink} to="/" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={RouterLink} to={`/feedback/${userId}`} color="inherit">
            Public Profile
          </MuiLink>
          <Typography color="text.primary">{user?.username}</Typography>
        </Breadcrumbs>

        <Typography variant="h5" gutterBottom>
          {user?.username}'s Profile
        </Typography>

        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <Avatar
            src={user?.profile_image_url}
            alt={user?.username}
            sx={{ width: 80, height: 80, mr: 3, bgcolor: "#fff", border: "2px solid #eee" }}
          >
            {!user?.profile_image_url && <PersonIcon />}
          </Avatar>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <StarRating rating={Math.round(avgScore)} size="large" />
              <Typography sx={{ ml: 1, fontWeight: 600 }}>{avgScore.toFixed(1)}</Typography>
            </div>
            <Typography color="text.secondary" fontSize={16}>
              {reviewCount} Review{reviewCount !== 1 ? "s" : ""}
            </Typography>
            <Typography>{user?.email || ""}</Typography>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews to display.</Typography>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((rev) => {
              const author = authorInfo[rev.author_id] || {};
              return (
                <Grid item xs={12} sm={6} md={4} key={rev.id}>
                  <Card variant="outlined" sx={{ bgcolor: "#fafafa" }}>
                    <CardHeader
                      avatar={
                        <Avatar src={author.profile_image_url}>
                          {!author.profile_image_url && <PersonIcon />}
                        </Avatar>
                      }
                      title={
                        <Typography fontWeight={600}>
                          {author.username || "User"}{" "}
                          <Typography component="span" color="text.secondary" fontSize={14}>
                            ({rev.author_role})
                          </Typography>
                        </Typography>
                      }
                      subheader={
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <StarRating rating={rev.user_ratings} size="small" />
                          <Typography color="text.secondary" fontSize={12} sx={{ ml: 1 }}>
                            {new Date(rev.created_at).toLocaleDateString()}
                          </Typography>
                        </div>
                      }
                    />
                    <CardContent>
                      <Typography>{rev.user_comments}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
