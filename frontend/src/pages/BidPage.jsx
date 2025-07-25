// src/pages/BidPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Breadcrumbs,
  Link,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import Rating from "@mui/material/Rating";
import "@material/web/button/filled-button.js";


export default function BidPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [auctionType, setAuctionType] = useState(null);
  const [currentDescPrice, setCurrentDescPrice] = useState(null);
  const [avgRating, setAvgRating] = useState(0);    // ← holds avg_rating
  const [totalReviews, setTotalReviews] = useState(0); // ← holds total_reviews

  // Fetch listing details (including category_id & category_name)
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error("Failed to load listing");
        const { listing } = await res.json();
        setListing(listing);
        // once we know the seller, fetch their rating
        fetch(`/api/feedback/ratings/${listing.seller_id}`)
          .then((res) => res.json())
          .then(({ avg_rating, total_reviews }) => {
            setAvgRating(avg_rating);
            setTotalReviews(total_reviews);
          })
          .catch(console.error);
        setAuctionType(listing.auction_type);

        if (listing.auction_type === "descending" && typeof listing.current_price === "number") {
          setCurrentDescPrice(listing.current_price);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchListing();
  }, [id]);

  // Fetch highest bid so far (min allowed)
  useEffect(() => {
    async function fetchMinAllowed() {
      try {
        const res = await fetch(`/api/auctions/${id}/min-bid`);
        if (!res.ok) throw new Error("Failed to load min bid");
        const { min_allowed } = await res.json();
        setMinPrice(min_allowed);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMinAllowed();
  }, [id]);

  // Submit a new bid
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const amount = parseFloat(bidAmount);

    if (isNaN(amount)) {
      setMessage("Please enter a valid number");
      return;
    }

    if (auctionType === "ascending") {
      if (amount <= minPrice) {
        setMessage(`❌ Your bid must be higher than $${minPrice.toFixed(2)}`);
        return;
      }
    } else if (auctionType === "descending") {
      if (typeof currentDescPrice === "number") {
        if (currentDescPrice > listing.min_bid && amount > currentDescPrice) {
          setMessage(`❌ Your bid must be lower than $${currentDescPrice.toFixed(2)}`);
          return;
        }
        if (amount < listing.min_bid) {
          setMessage(`❌ Your bid must be at least $${listing.min_bid}`);
          return;
        }
      }
    }

    if (amount > 99999999.99) {
      alert("The bid amount cannot exceed 99,999,999.99");
      return;
    }

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auction_id: id, bid_amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Bid submitted!");
      // ** Optimistic update: **
      if (auctionType === "ascending") {
        setMinPrice(amount);
      } else if (auctionType === "descending") {
        setCurrentDescPrice(amount);
      }
      setBidAmount("");           // clear the input
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Loading fallback
  if (!listing || minPrice === null) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography>Loading auction info…</Typography>
      </Box>
    );
  }

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        {/* ← Manual breadcrumbs with custom “parent” because we dont have correct nav */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            // target all links and the final Typography:
            '& .MuiBreadcrumbs-li, & a, & .MuiTypography-root': {
              fontSize: '16px',
            }
          }}
        >
          <Link
            component={RouterLink}
            to="/dashboard"
            underline="hover"
            color="inherit"
          >
            Home
          </Link>

          <Link
            component={RouterLink}
            to={`/listings?category=${encodeURIComponent(listing.category_id)}`}
            underline="hover"
            color="inherit"
          >
            {listing.category_name}
          </Link>

          {/* last crumb now shows the listing title */}
          <Typography color="text.primary">
            {listing.title}
          </Typography>
        </Breadcrumbs>


        <div className="profileTitle">
          {listing.title}
        </div>

        <div className="twoboxes">
          {/* Listing Details */}
          <div className="listingDeets">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                style={{
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 24,
                  maxHeight: "400px"
                }}
              />
            ) : (
              <Avatar
                variant="square"
                sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
              >
                <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
              </Avatar>
            )}

            <div className="listingWords">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ marginRight: "8px" }}>Sold by:</div>
                <Avatar
                  src={listing.seller_avatar}
                  alt={listing.seller_username}
                  sx={{ width: 32, height: 32, marginRight: "8px" }}
                />
                <div>{listing.seller_username}</div>
              </div>
              {/* —— NEW: display avg rating in small stars —— */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Rating
                  name="seller-rating"
                  value={avgRating}
                  size="small"
                  readOnly
                  precision={0.5}
                />
                <Typography
                  variant="body2"
                  sx={{ ml: 0.5, fontSize: 14, color: "text.secondary" }}
                >
                  ({totalReviews})
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: 16 }}
              >
                Ends: {new Date(listing.end_date).toLocaleString("en-SG")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: 16 }}>
                {listing.description}
              </Typography>

             
            </div>
          </div>

          {/* Bid Form */}
          <div className="bidDeets">
             <Typography
                variant="subtitle2"
                component="span"
                sx={{
                  fontSize: 16,
                  display: "inline-block",
                  px: 1.5,
                  py: 0.5,
                  border: "1px solid",
                  borderColor: "grey.800",
                  borderRadius: "999px",
                  color: "grey.800",
                  mr: 1,
                }}
              >
                Starting bid:&nbsp;
                <strong>{auctionType === "descending" ? Number(listing.start_price).toFixed(2) : Number(listing.min_bid).toFixed(2)}</strong>
              </Typography>

              <Typography
                variant="subtitle2"
                component="span"
                sx={{
                  fontSize: 16,
                  display: "inline-block",
                  px: 1.5,
                  py: 0.5,
                  border: "1px solid",
                  borderColor: "success.main",
                  borderRadius: "999px",
                  color: "success.main",
                }}
              >
                Current bid:&nbsp;
                <strong>
                  {auctionType === "descending" ? (
                    // descending: compare against the listing.start_price
                    typeof currentDescPrice === "number" && currentDescPrice !== listing.start_price
                      ? currentDescPrice.toFixed(2)
                      : "No bids yet"
                  ) : (
                    // ascending: compare against listing.min_bid
                    minPrice !== listing.min_bid
                      ? minPrice.toFixed(2)
                      : "No bids yet"
                  )}
                </strong>
              </Typography>
            <h2>Place your bid</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="bidAmount">Bid Amount ($):</label>
              <input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
                min={auctionType === "ascending" ? minPrice : (listing && typeof listing.min_bid === "number" ? listing.min_bid : 1)}
                max={auctionType === "descending" ? (currentDescPrice !== null ? currentDescPrice : undefined) : undefined}
                step="0.01"
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0 16px",
                  boxSizing: "border-box",
                }}
              />
              <md-filled-button
                type="submit"
                disabled={message.startsWith("✅")}
                style={{ width: "100%", padding: "10px" }}
              >
                Submit Bid
              </md-filled-button>
            </form>

            {message && (
              <Typography
                variant="body2"
                align="center"
                sx={{
                  mt: 2,
                  color: message.startsWith("✅")
                    ? "success.main"
                    : "error.main",
                }}
              >
                {message}
              </Typography>
            )}
          </div>
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}
