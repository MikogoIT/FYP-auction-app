// src/components/ListingCard.jsx
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
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
        <p className="listingMinBid">
          <strong>Min Bid:</strong> ${item.min_bid}
        </p>
        <p className="listingEndDate">
          <strong>Ends:</strong>{" "}
          {new Date(item.end_date).toLocaleString("en-SG")}
        </p>
        <p>
          <strong>Current Bid:</strong>{" "}
          {item.current_bid != null
            ? `$${item.current_bid}`
            : "No bids yet"}
        </p>
      </div>

      <div className="listingAction">
        <IconButton onClick={() => onToggleLike(item.id)} size="large">
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>

        {isOwner ? (
          <md-filled-button
            onClick={() => onEditClick(item.id)}
            style={{
              flexGrow: 1,
              "--md-sys-color-primary": yellow,
              "--md-sys-color-on-primary": contrastText,
            }}
          >
            Edit
          </md-filled-button>
        ) : (
          <md-filled-button
            onClick={() => onBidClick(item.id)}
            style={{ flexGrow: 1 }}
          >
            Bid
          </md-filled-button>
        )}
      </div>
    </div>
  );
}
