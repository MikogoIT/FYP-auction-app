// src/components/ListingCard.jsx
import React from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Typography from "@mui/material/Typography";
import "@material/web/button/filled-button.js";
import { useTheme } from "@mui/material/styles";

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
  const isOwner = item.seller_id === currentUserId;

  return (
    <div className="listingCard">
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

      <div className="listingDetails">
        <div className="listingTitle">{item.title}</div>

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
                ? `$${Number(item.current_price).toFixed(2)}`
                : "No bids yet"
              : item.current_bid != null
              ? `$${Number(item.current_bid).toFixed(2)}`
              : "No bids yet"}
          </strong>
        </Typography>
      </div>

      <div className="listingAction">
        <IconButton onClick={() => onToggleLike(item.id)} size="large">
          {isLiked ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>

        {/* Combined conditional button for Edit vs Bid */}
        <md-filled-button
          onClick={() => (isOwner ? onEditClick(item.id) : onBidClick(item.id))}
          style={{
            flexGrow: 1,
            "--md-sys-color-primary": isOwner ? yellow : undefined,
            "--md-sys-color-on-primary": isOwner ? contrastText : undefined,
          }}
        >
          {isOwner ? "Edit" : "Bid"}
        </md-filled-button>
      </div>
    </div>
  );
}
