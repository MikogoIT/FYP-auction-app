import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Rating,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("latest");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("/api/feedback/list");
        const data = await res.json();
        if (res.ok) setFeedbacks(data);
        else setError(data.message || "Failed to load feedbacks.");
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOption === "highest") {
      return b.website_ratings - a.website_ratings;
    } else if (sortOption === "lowest") {
      return a.website_ratings - b.website_ratings;
    }
    return 0;
  });

  // Show up to 6 feedbacks
  const visibleFeedbacks = sortedFeedbacks.slice(0, 6);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        ⭐ Website Feedback
      </Typography>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sortOption-label">Sort by</InputLabel>
          <Select
            labelId="sortOption-label"
            id="sortOption"
            value={sortOption}
            label="Sort by"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="highest">Highest Rating</MenuItem>
            <MenuItem value="lowest">Lowest Rating</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3} justifyContent="center">
        {visibleFeedbacks.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center">No feedback submitted yet.</Typography>
          </Grid>
        ) : (
          visibleFeedbacks.map((fb) => (
            <Grid item xs={12} sm={6} md={4} key={fb.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  width: "100%",
                  minHeight: 230,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={fb.profile_image_url || undefined}
                      alt={fb.username}
                    />
                  }
                  title={fb.username}
                  subheader={new Date(fb.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Rating value={fb.website_ratings} readOnly size="small" />
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      maxHeight: 80,
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {fb.website_comments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
