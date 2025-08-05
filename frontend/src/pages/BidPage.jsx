// src/pages/BidPage.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Breadcrumbs,
  Link,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SoldBy from '../components/SoldBy';

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
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Helpers to detect whether there has been a bid
  const hasAscBid = useCallback(() => {
    if (!listing || minPrice === null) return false;
    return Number(minPrice) > Number(listing.min_bid) + 1e-9;
  }, [listing, minPrice]);

  const hasDescBid = useCallback(() => {
    if (!listing || currentDescPrice === null) return false;
    return Number(currentDescPrice) < Number(listing.start_price) - 1e-9;
  }, [listing, currentDescPrice]);

  // Debug logging
  useEffect(() => {
    console.log("=== BidPage state ===");
    console.log("auctionType:", auctionType);
    console.log("listing:", listing);
    console.log("minPrice (ascending):", minPrice);
    console.log("currentDescPrice (descending):", currentDescPrice);
    console.log("hasAscBid:", hasAscBid());
    console.log("hasDescBid:", hasDescBid());
    console.log("=====================");
  }, [auctionType, listing, minPrice, currentDescPrice, hasAscBid, hasDescBid]);

  // Fetch listing details
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const { listing } = await res.json();
        setListing(listing);
        setAuctionType(listing.auction_type);

        // Fetch seller rating
        fetch(`/api/feedback/ratings/${listing.seller_id}`)
          .then((res) => res.json())
          .then(({ avg_rating, total_reviews }) => {
            setAvgRating(avg_rating);
            setTotalReviews(total_reviews);
          })
          .catch((e) => console.error("Rating fetch error:", e));

        // Set descending auction’s current price
        if (listing.auction_type === "descending" && typeof listing.current_price === "number") {
          setCurrentDescPrice(listing.current_price);
        }
      } catch (err) {
        console.error("fetchListing error:", err);
      }
    }
    fetchListing();
  }, [id]);

  // Fetch current highest bid (min allowed)
  useEffect(() => {
    async function fetchMinAllowed() {
      try {
        const res = await fetch(`/api/auctions/${id}/min-bid`);
        if (!res.ok) throw new Error(await res.text());
        const { min_allowed } = await res.json();
        setMinPrice(min_allowed);
      } catch (err) {
        console.error("fetchMinAllowed error:", err);
      }
    }
    fetchMinAllowed();
  }, [id]);

  // Bid submission handler...
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      setMessage("Please enter a valid number");
      return;
    }
    // (Your existing validation logic here…)
    // On success, optimistically update:
    if (auctionType === "ascending") {
      setMinPrice(amount);
    } else {
      setCurrentDescPrice(amount);
    }
    setBidAmount("");
    setMessage("✅ Bid submitted!");
  };

  // Loading state
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
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 2,
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            "& .MuiBreadcrumbs-li, & a, & .MuiTypography-root": {
              fontSize: "16px",
            },
          }}
        >
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
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
          <Typography color="text.primary">{listing.title}</Typography>
        </Breadcrumbs>

        <div className="profileTitle">{listing.title}</div>

        <div className="twoboxes">
          {/* Left box: image & description */}
          <div className="listingDeets">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                style={{
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 24,
                  maxHeight: "400px",
                }}
              />
            ) : (
              <Avatar variant="square" sx={{ width: "100%", height: 200, bgcolor: "#eee" }}>
                <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
              </Avatar>
            )}

            <div className="listingWords">
              <SoldBy
                sellerId={listing.seller_id}
                sellerUsername={listing.seller_username}
                sellerAvatar={listing.seller_avatar}
                avgRating={avgRating}
                totalReviews={totalReviews}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 16 }}>
                Ends: {new Date(listing.end_date).toLocaleString("en-SG")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: 16 }}>
                {listing.description}
              </Typography>
            </div>
          </div>

          {/* Right box: bidding details */}
          <div className="bidDeets">
            {/* New: Auction type display */}
            <Typography variant="body1" sx={{ mb: 1, fontSize: 16 }}>
              Auction type: <strong>{auctionType}</strong>
            </Typography>

            {/* Starting bid pill */}
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
              <strong>
                {auctionType === "descending"
                  ? Number(listing.start_price).toFixed(2)
                  : Number(listing.min_bid).toFixed(2)}
              </strong>
            </Typography>

            {/* Current price pill (null-check logic) */}
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
              Current price:&nbsp;
              <strong>
                {auctionType === "descending" ? (
                  currentDescPrice != null
                    ? Number(currentDescPrice).toFixed(2)
                    : "No bids yet"
                ) : (
                  hasAscBid()
                    ? Number(minPrice).toFixed(2)
                    : "No bids yet"
                )}
              </strong>
            </Typography>

            <h2>Place your bid</h2>
            <form onSubmit={handleSubmit}>
              {/* … your bid form inputs/buttons here … */}
            </form>

            {message && (
              <Typography
                variant="body2"
                align="center"
                sx={{
                  mt: 2,
                  color: message.startsWith("✅") ? "success.main" : "error.main",
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
