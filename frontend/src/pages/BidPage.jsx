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

  // Derived helpers
  const hasAscBid = useCallback(() => {
    if (!listing) return false;
    const listingMinBidNum = Number(listing.min_bid);
    const minPriceNum = Number(minPrice);
    if (isNaN(minPriceNum)) return false;
    // If minPrice is strictly greater than initial min bid, there's been a bid
    return minPriceNum > listingMinBidNum + 1e-9;
  }, [listing, minPrice]);

  const hasDescBid = useCallback(() => {
    if (!listing) return false;
    const startPriceNum = Number(listing.start_price);
    const currentNum = Number(currentDescPrice);
    if (isNaN(currentNum)) return false;
    // In descending, a bid lowers price; only show current if it's strictly less than start
    return currentNum < startPriceNum - 1e-9;
  }, [listing, currentDescPrice]);

  // Log internal state for debugging whenever key pieces change
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

  // Fetch listing details (including category_id & category_name)
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Failed to load listing: ${t}`);
        }
        const { listing } = await res.json();
        setListing(listing);
        setAuctionType(listing.auction_type);

        // once we know the seller, fetch their rating
        fetch(`/api/feedback/ratings/${listing.seller_id}`)
          .then((res) => res.json())
          .then(({ avg_rating, total_reviews }) => {
            setAvgRating(avg_rating);
            setTotalReviews(total_reviews);
          })
          .catch((e) => console.error("Rating fetch error:", e));

        if (listing.auction_type === "descending" && typeof listing.current_price === "number") {
          setCurrentDescPrice(listing.current_price);
        }
      } catch (err) {
        console.error("fetchListing error:", err);
      }
    }
    fetchListing();
  }, [id]);

  // Fetch highest bid so far (min allowed)
  useEffect(() => {
    async function fetchMinAllowed() {
      try {
        const res = await fetch(`/api/auctions/${id}/min-bid`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Failed to load min bid: ${t}`);
        }
        const { min_allowed } = await res.json();
        setMinPrice(min_allowed);
      } catch (err) {
        console.error("fetchMinAllowed error:", err);
      }
    }
    fetchMinAllowed();
  }, [id]);

  // Submit a new bid
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const amount = parseFloat(bidAmount);
    console.log("Submitting bid:", {
      bidAmount,
      parsedAmount: amount,
      auctionType,
      listing,
      minPrice,
      currentDescPrice,
    });

    if (isNaN(amount)) {
      setMessage("Please enter a valid number");
      return;
    }

    if (auctionType === "ascending") {
      if (!hasAscBid()) {
        // no existing bid; compare against listing.min_bid
        const base = Number(listing.min_bid);
        if (amount <= base) {
          setMessage(`❌ Your bid must be higher than $${base.toFixed(2)}`);
          return;
        }
      } else {
        // there is an existing bid; compare against minPrice (which is the current highest)
        const current = Number(minPrice);
        if (amount <= current) {
          setMessage(`❌ Your bid must be higher than $${current.toFixed(2)}`);
          return;
        }
      }
    } else if (auctionType === "descending") {
      if (typeof currentDescPrice === "number") {
        const currentNum = Number(currentDescPrice);
        // descending: bids must be lower than current (or start) but not below listing.min_bid
        const floor = Number(listing.min_bid);
        const compareBase = hasDescBid() ? currentNum : Number(listing.start_price);

        if (amount >= compareBase) {
          setMessage(`❌ Your bid must be lower than $${compareBase.toFixed(2)}`);
          return;
        }
        if (amount < floor) {
          setMessage(`❌ Your bid must be at least $${floor.toFixed(2)}`);
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
      if (!res.ok) throw new Error(data.message || "Bid failed");

      setMessage("✅ Bid submitted!");
      // Optimistic update
      if (auctionType === "ascending") {
        setMinPrice(amount);
      } else if (auctionType === "descending") {
        setCurrentDescPrice(amount);
      }
      setBidAmount("");
    } catch (err) {
      console.error("bid submit error:", err);
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

          <Typography color="text.primary">{listing.title}</Typography>
        </Breadcrumbs>

        <div className="profileTitle">{listing.title}</div>

        <div className="twoboxes">
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
              <Avatar
                variant="square"
                sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
              >
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
              <strong>
                {auctionType === "descending"
                  ? Number(listing.start_price).toFixed(2)
                  : Number(listing.min_bid).toFixed(2)}
              </strong>
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
                  hasDescBid()
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
              <label htmlFor="bidAmount">Bid Amount ($):</label>
              <input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
                min={
                  auctionType === "ascending"
                    ? minPrice
                    : listing && typeof listing.min_bid === "number"
                    ? listing.min_bid
                    : 1
                }
                max={
                  auctionType === "descending"
                    ? hasDescBid()
                      ? currentDescPrice
                      : Number(listing.start_price)
                    : undefined
                }
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
