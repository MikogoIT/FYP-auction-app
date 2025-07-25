import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "mui/icons-material/ImageIcon";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import SoldBy from '../components/SoldBy';
import "@material/web/button/filled-button.js";

export default function ListingCard({
  item,
  isLiked,
  onToggleLike,
  onBidClick,
  onEditClick,
  currentUserId,
}) {
  const theme = useTheme();
  const yellow = theme.palette.warning.light;
  const contrastText = theme.palette.getContrastText(yellow);
  const greyBg = theme.palette.grey[300];
  const blackText = theme.palette.common.black;
  const isOwner = item.seller_id === currentUserId;
  const isExpired = !item.is_active;

  // State for seller ratings
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch seller's average rating and review count
  useEffect(() => {
    async function fetchSellerRating() {
      try {
        const res = await fetch(`/api/feedback/ratings/${item.seller_id}`);
        if (!res.ok) throw new Error("Failed to load seller ratings");
        const data = await res.json();
        setAvgRating(data.avg_rating || 0);
        setTotalReviews(data.total_reviews || 0);
      } catch (err) {
        console.error(err);
      }
    }
    if (item.seller_id) fetchSellerRating();
  }, [item.seller_id]);

  // Determine button text, handler, and styling
  const actionText = isExpired
    ? "Expired"
    : isOwner
    ? "Edit"
    : "Bid";

  const actionHandler = isExpired
    ? undefined
    : () => {
        if (isOwner) {
          onEditClick(item.id);
        } else {
          onBidClick(item.id);
        }
      };

  const actionStyle = {
    flexGrow: 1,
    ...(isExpired
      ? {
          "--md-sys-color-primary": greyBg,
          "--md-sys-color-on-primary": blackText,
          cursor: "default",
        }
      : isOwner
      ? {
          "--md-sys-color-primary": yellow,
          "--md-sys-color-on-primary": contrastText,
        }
      : {}),
  };

  return (
    <div className="listingCard">
      <div>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="listingImage"
          />
        ) : (
          <Avatar
            variant="square"
            sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
          >
            <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
          </Avatar>
        )}
        <div className="listingTitle">{item.title}</div>
      </div>

      <div className="listingDetails">
        <SoldBy
          sellerId={item.seller_id}
          sellerUsername={item.seller_username}
          sellerAvatar={item.seller_avatar}
          avgRating={avgRating}
          totalReviews={totalReviews}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: 16 }}
        >
          Ends: {new Date(item.end_date).toLocaleString("en-SG")}
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
            borderColor: "grey.800",
            borderRadius: "999px",
            color: "grey.800",
            mb: 1,
            width: "fit-content",
          }}
        >
          Starting bid:&nbsp;
          <strong>
            {item.auction_type === "descending"
              ? Number(item.start_price).toFixed(2)
              : Number(item.min_bid).toFixed(2)}
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
            width: "fit-content",
          }}
        >
          Current bid:&nbsp;
          <strong>
            {item.auction_type === "descending"
              ? item.current_price != null
                ? `$\${Number(item.current_price).toFixed(2)}`
                : "No bids yet"
              : item.current_bid != null
              ? `$\${Number(item.current_bid).toFixed(2)}`
              : "No bids yet"}
          </strong>
        </Typography>
      </div>

      <div className="listingAction">
        <IconButton onClick={() => onToggleLike(item.id)} size="large">
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>

        <md-filled-button onClick={actionHandler} disabled={isExpired} style={actionStyle}>
          {actionText}
        </md-filled-button>
      </div>
    </div>
  );
}
