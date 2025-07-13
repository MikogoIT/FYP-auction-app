// src/components/TelegramFollowButton.jsx
import Button from "@mui/material/Button";
import TelegramIcon from "@mui/icons-material/Telegram";

const getChannelUrl = (category) => {
  const baseName = category.toLowerCase().replace(/\s+/g, "_");
  const suffix = "fypauction";
  return `https://t.me/${baseName}_${suffix}`;
};

export default function TelegramFollowButton({ category }) {
  const channelUrl = getChannelUrl(category);
  const handleFollow = (e) => {
    e.stopPropagation();
    window.open(channelUrl, "_blank");
  };

  return (
    <Button
      onClick={handleFollow}
      startIcon={
        <TelegramIcon sx={{ fontSize: "1.2rem", verticalAlign: "middle" }} />
      }
      variant="contained"
      sx={{
        borderRadius: "999px",          // pill
        backgroundColor: "#0088cc",     // telegram blue
        color: "#fff",                  // text
        textTransform: "none",          // no uppercase
        fontSize: 16,               // 16px
        fontWeight: 400,
        lineHeight: 1,
        py: 2,                          // vertical padding
        px: 3,                          // horizontal padding
        "&:hover": {
          backgroundColor: "#007ab8",   // slightly darker on hover
        },
      }}
    >
      Follow {category} on Telegram
    </Button>
  );
}
