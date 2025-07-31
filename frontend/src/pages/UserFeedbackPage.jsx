// src/pages/UserFeedback.jsx

import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Rating,
  TextField,
  Typography,
  Avatar,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
const MAX_WORDS = 100;

export default function UserFeedback() {
  const { auctionId } = useParams();
  console.log("UserFeedbackPage mounted with auctionId:", auctionId);

  // Feedback form state
  const [userRating, setUserRating] = useState(5);
  const [userComments, setUserComments] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wordCount = countWords(userComments);

  // Auction metadata state
  const [listingTitle, setListingTitle] = useState("");
  const [buyerId, setBuyerId] = useState(null);
  const [buyerUsername, setBuyerUsername] = useState("");
  const [buyerProfileImageUrl, setBuyerProfileImageUrl] = useState("");
  const [sellerId, setSellerId] = useState(null);
  const [sellerUsername, setSellerUsername] = useState("");
  const [sellerProfileImageUrl, setSellerProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    async function fetchPeople() {
      try {
        const res = await fetch(`/api/listings/${auctionId}/people`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        console.log("Auction people data:", data);
        setListingTitle(data.listingTitle);
        setBuyerId(data.buyer.id);
        setBuyerUsername(data.buyer.username);
        setBuyerProfileImageUrl(data.buyer.profileImageUrl);
        setSellerId(data.seller.id);
        setSellerUsername(data.seller.username);
        setSellerProfileImageUrl(data.seller.profileImageUrl);
        setCoverImageUrl(data.coverImageUrl);
      } catch (err) {
        console.error("Error fetching auction people:", err);
      }
    }
    fetchPeople();
  }, [auctionId]);

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (countWords(value) <= MAX_WORDS) {
      setUserComments(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      console.log("Fetch response status:", res.status);
      const data = await res.json();
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
        {/* Custom breadcrumbs */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            width: "100%",
            mb: 3,
            "& a, & .MuiTypography-root": { fontSize: "16px" },
          }}
        >
          <MuiLink
            component={RouterLink}
            to="/dashboard"
            underline="hover"
            color="inherit"
          >
            Home
          </MuiLink>
          <Typography color="text.primary">User review</Typography>
        </Breadcrumbs>
        <div id="wideTitle" className="profileTitle">
          Write review for {sellerUsername}
        </div>


        {/* Auction cover image & title */}
        {coverImageUrl && (
          <Box textAlign="center" sx={{my: '24px'}}>
            <img
              src={coverImageUrl}
              alt="Auction cover"
              style={{ width: "160px", objectFit: "cover", borderRadius: 8 }}
            />
            {listingTitle && (
              <div className="smallTitle">
                {listingTitle}
              </div>
            )}
          </Box>
        )}

        {/* Seller and Buyer sections with links to profiles */}
        <Box display="flex" gap={4} mb={4} justifyContent="center">
          <MuiLink
            component={RouterLink}
            to={sellerId ? `/feedback/${sellerId}` : '#'}
            underline="none"
            color="inherit"
          >
            <Box textAlign="center">
              <div>Seller</div>
              <Avatar
                src={sellerProfileImageUrl}
                alt={sellerUsername}
                sx={{ width: 56, height: 56, margin: '5px auto' }}
              />
              <div>{sellerUsername}</div>
            </Box>
          </MuiLink>

          <MuiLink
            component={RouterLink}
            to={buyerId ? `/feedback/${buyerId}` : '#'}
            underline="none"
            color="inherit"
          >
            <Box textAlign="center">
              <div>Auction Winner</div>
              <Avatar
                src={buyerProfileImageUrl}
                alt={buyerUsername}
                sx={{ width: 56, height: 56, margin: '5px auto' }}
              />
              <div>{buyerUsername}</div>
            </Box>
          </MuiLink>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: '90%', maxWidth: '1000px', }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '16px' }}>
              {wordCount} / {MAX_WORDS} words
              {wordCount >= MAX_WORDS && (
                <Typography component="span" variant="caption" sx={{ color: "error.main", ml: 1, fontSize: '16px' }}>
                  (Word limit reached)
                </Typography>
              )}
            </Typography>
          </Box>

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <md-filled-button
              type="submit"
              disabled={loading || submitted}
              sx={{ fontSize: '16px'}}
            >
              {loading ? "Submitting…" : "Submit"}
            </md-filled-button>
          </div>

          {msg && (
            <Typography
              variant="body2"
              align="center"
              sx={{ fontSize: '16px', mt: 2, fontWeight: 600, color: msg.startsWith("✅") ? "success.main" : "error.main" }}
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
