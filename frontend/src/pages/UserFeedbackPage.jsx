import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Rating, TextField, Typography } from "@mui/material";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
const MAX_WORDS = 100;

export default function UserFeedback({
  auctionId,
  recipientId,
  authorRole = "Buyer",
}) {
  // Also to include seller
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
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/feedback/auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auction_id: auctionId,
          recipient_id: recipientId,
          author_role: authorRole,
          user_ratings: userRating,
          user_comments: userComments,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setMsg("You have already submitted your feedback!");
        setSubmitted(true);
      } else if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setSubmitted(true);
        setUserComments("");
        if (onSuccess) onSuccess();
      } else {
        setMsg(
          "❌ " + (data.error || data.message || "Failed to submit feedback."),
        );
      }
    } catch {
      setMsg("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        maxWidth: 500,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        boxSizing: "border-box",
        fontFamily: "Roboto, sans-serif",
        fontSize: "16px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>User Feedback</h2>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
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

        {/* Comments */}
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

        {/* Word count */}
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {wordCount} / 100 words
            {wordCount >= 100 && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "error.main", ml: 1 }}
              >
                (Word limit reached)
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Submit */}
        <Box sx={{ textAlign: "center" }}>
          <md-filled-button
            type="submit"
            disabled={loading || submitted}
            sx={{ padding: "0px 40px" }}
          >
            {loading ? "Submitting…" : "Submit"}
          </md-filled-button>
        </Box>

        {/* Message */}
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
    </Box>
  );
}
