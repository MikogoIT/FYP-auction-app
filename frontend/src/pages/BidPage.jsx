// src/pages/BidPage.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { Typography, Avatar, Breadcrumbs, Link } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SoldBy from "../components/SoldBy";

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

  // Fetch listing details
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const { listing } = await res.json();
        setListing(listing);
        setAuctionType(listing.auction_type);

        // seller rating
        fetch(`/api/feedback/ratings/${listing.seller_id}`)
          .then((r) => r.json())
          .then(({ avg_rating, total_reviews }) => {
            setAvgRating(avg_rating);
            setTotalReviews(total_reviews);
          })
          .catch((e) => console.error(e));

        // descending current price
        if (
          listing.auction_type === "descending" &&
          listing.current_price != null
        ) {
          const p = parseFloat(listing.current_price);
          if (!isNaN(p)) setCurrentDescPrice(p);
        }
      } catch (err) {
        console.error(err);
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
        console.error(err);
      }
    }
    fetchMinAllowed();
  }, [id]);

  // Submit a new bid
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1) Choose the correct "amount" depending on auction type
    let amount;
    if (auctionType === "descending") {
      // descending auctions always bid at currentDescPrice
      if (typeof currentDescPrice !== "number") {
        setMessage("Unable to determine current price for bidding");
        return;
      }
      amount = currentDescPrice;
    } else {
      // ascending auctions read from the input field
      amount = parseFloat(bidAmount);
      if (isNaN(amount)) {
        setMessage("Please enter a valid number");
        return;
      }
    }

    console.log("Submitting bid:", {
      auctionType,
      amount,
      listing,
      minPrice,
      currentDescPrice,
    });

    // 2) Validation logic
    if (auctionType === "ascending") {
      const floor = Number(listing.min_bid);
      const base = hasAscBid() ? Number(minPrice) : floor;
      if (amount <= base) {
        setMessage(`❌ Your bid must be higher than $${base.toFixed(2)}`);
        return;
      }
    } else {
      // descending
      const floor = Number(listing.min_bid);
      const cap = hasDescBid()
        ? Number(currentDescPrice)
        : Number(listing.start_price);

      if (amount >= cap) {
        setMessage(`❌ Your bid must be lower than $${cap.toFixed(2)}`);
        return;
      }
      if (amount < floor) {
        setMessage(`❌ Your bid must be at least $${floor.toFixed(2)}`);
        return;
      }
    }

    // 3) Extreme upper bound sanity check
    if (amount > 99_999_999.99) {
      alert("The bid amount cannot exceed 99,999,999.99");
      return;
    }

    // 4) Send to server
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
      // optimistic update
      if (auctionType === "ascending") {
        setMinPrice(amount);
        setBidAmount("");
      } else {
        setCurrentDescPrice(amount);
      }
    } catch (err) {
      console.error("bid submit error:", err);
      setMessage(err.message);
    }
  };


  // Loading state
  if (!listing || minPrice === null) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Typography>Loading auction info…</Typography>
      </div>
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
          {/* Left column */}
          <div className="listingDeets">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                style={{
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 24,
                  maxHeight: 400,
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

          {/* Right column */}
          <div className="bidDeets">
            <Typography variant="body1" sx={{ mb: 1, fontSize: 16 }}>
              Auction type: <strong>{auctionType}</strong>
            </Typography>

            {/* Pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",   // ➜  wrap to a new line
                gap: 8,               // ➜ 8px space between each pill
              }}
            >
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
                  whiteSpace: "nowrap", // ➜ prevent text‐inside‐the‐pill from breaking
                }}
              >
                Starting bid:&nbsp;
                <strong>
                  {auctionType === "descending"
                    ? Number(listing.start_price).toFixed(2)
                    : Number(listing.min_bid).toFixed(2)}
                </strong>
              </Typography>

              {/* Minimum bid (descending only) */}
              {auctionType === "descending" && (
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
                    whiteSpace: "nowrap",
                  }}
                >
                  Minimum bid:&nbsp;
                  <strong>{Number(listing.min_bid).toFixed(2)}</strong>
                </Typography>
              )}

              {/* Current price pill */}
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
                  whiteSpace: "nowrap",
                }}
              >
                Current price:&nbsp;
                <strong>
                  {auctionType === "descending"
                    ? currentDescPrice != null
                      ? Number(currentDescPrice).toFixed(2)
                      : "No bids yet"
                    : hasAscBid()
                    ? Number(minPrice).toFixed(2)
                    : "No bids yet"}
                </strong>
              </Typography>
            </div>

            <h2>Place your bid</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="bidAmount">Bid Amount ($):</label>

              {auctionType === "descending" ? (
                <>
                  <input
                    id="bidAmount"
                    type="number"
                    value={
                      currentDescPrice != null
                        ? currentDescPrice.toFixed(2)
                        : ""
                    }
                    readOnly
                    style={{
                      width: "100%",
                      padding: 8,
                      margin: "8px 0 4px",
                      boxSizing: "border-box",
                      color: "green",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginBottom: 2 }}
                  >
                    For descending auctions, you can only bid at the
                    current price. This field is pre-filled and cannot
                    be changed.
                  </Typography>
                </>
              ) : (
                <input
                  id="bidAmount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                  min={
                    auctionType === "ascending"
                      ? minPrice
                      : typeof listing.min_bid === "number"
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
                    padding: 8,
                    margin: "8px 0 16px",
                    boxSizing: "border-box",
                  }}
                />
              )}

              <md-filled-button
                type="submit"
                disabled={message.startsWith("✅")}
                style={{ width: "100%", padding: 10 }}
              >
                Submit Bid
              </md-filled-button>
            </form>

            {message && (
              <Typography
                variant="body2"
                align="center"
                sx={{
                  marginTop: 2,
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
