import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Rating, TextField, Typography } from "@mui/material";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
const MAX_WORDS = 100;

export default function UserFeedback() {
  const { auctionId } = useParams(); // ← gets :auctionId from the URL
  console.log("UserFeedbackPage mounted with auctionId:", auctionId);

  const [userRating, setUserRating] = useState(5);
  const [userComments, setUserComments] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wordCount = countWords(userComments);

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (countWords(value) <= MAX_WORDS) {
      setUserComments(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log request payload
    console.log("Submitting feedback payload:", {
      auction_id: auctionId,
      user_ratings: userRating,
      user_comments: userComments,
    });
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/feedback/auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auction_id: auctionId,
          user_ratings: userRating,
          user_comments: userComments,
        }),
      });
      // Log fetch status
      console.log("Fetch response status:", res.status);

      const data = await res.json();
      // Log full API response
      console.log("API response data:", data);

      if (res.status === 409) {
        setMsg("You have already submitted your feedback!");
        setSubmitted(true);
      } else if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setSubmitted(true);
        setUserComments("");
      } else {
        setMsg(
          "❌ " + (data.error || data.message || "Failed to submit feedback."),
        );
      }
    } catch (err) {
      console.error("Error during feedback submission:", err);
      setMsg("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />
        <div id="wideTitle" className="profileTitle">
          Write review for user X
        </div>

        <form onSubmit={handleSubmit}>
          <Box mb={2} display="flex" alignItems="center" gap={1}>
            <Rating
              name="userRating"
              id="userRating"
              value={userRating}
              onChange={(_, value) => setUserRating(value)}
              readOnly={submitted || loading}
              size="large"
            />
          </Box>

          <TextField
            label="Review"
            placeholder="Share your feedback about this user..."
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={userComments}
            onChange={handleCommentChange}
            disabled={submitted || loading}
          />

          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Typography variant="caption" color="text.secondary">
              {wordCount} / {MAX_WORDS} words
              {wordCount >= MAX_WORDS && (
                <Typography component="span" variant="caption" sx={{ color: "error.main", ml: 1 }}>
                  (Word limit reached)
                </Typography>
              )}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <md-filled-button type="submit" disabled={loading || submitted} sx={{ padding: "0px 40px" }}>
              {loading ? "Submitting…" : "Submit"}
            </md-filled-button>
          </Box>

          {msg && (
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 2,
                fontWeight: 600,
                color: msg.startsWith("✅") ? "success.main" : "error.main",
              }}
              aria-live="polite"
            >
              {msg}
            </Typography>
          )}
        </form>
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
