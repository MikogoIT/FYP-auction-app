// src/components/FeedbackForm.jsx
import { useState } from "react";
import {
  Box,
  Rating,
  TextField,
  Typography
} from "@mui/material";
import "@material/web/button/filled-button.js";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function FeedbackForm({
  endpoint = "/api/feedback",
  onSuccess,
}) {
  const [website_comments, setComments] = useState("");
  const [website_ratings, setRatings] = useState(5);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wordCount = countWords(website_comments);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!website_comments.trim()) {
      setMsg("Feedback cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ website_comments, website_ratings }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setMsg("You have already submitted feedback.");
        setSubmitted(true);
      } else if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setComments("");
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setMsg( (data.message || "Failed to submit feedback."));
      }
    } catch {
      setMsg("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        width: 700,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,

        // force 16px/Roboto on everything inside here:
        "&, & *": {
          fontFamily: "Roboto, sans-serif",
          fontSize: "16px",
        },
  }}
    >

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <Box mb={2} display="flex" alignItems="center" gap={1}>
          <Rating
            name="website_ratings"
            id="website_ratings"
            value={website_ratings}
            onChange={(_, value) => setRatings(value)}
            readOnly={submitted || loading}
          />
        </Box>

        {/* Comments */}
        <TextField
          label="Review"
          placeholder="Tell us what you think of Auctioneer!"
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={website_comments}
          onChange={(e) => {
            const v = e.target.value;
            if (countWords(v) <= 100) setComments(v);
          }}
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
        <Box mt={3}>
          <md-filled-button
            type="submit"
            disabled={loading || submitted}
            
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
