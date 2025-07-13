// src/components/TelegramFollowButton.jsx
import TelegramIcon from "@mui/icons-material/Telegram";
import "@material/web/button/filled-button.js";

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
    <md-filled-button
      onClick={handleFollow}
      style={{
        display: "inline-flex",          // inline-flex so it sizes to content
        alignItems: "center",            // vertical center
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.6rem 1.2rem",         // tweak for a nice pill
        borderRadius: "999px",           // full pill shape
        backgroundColor: "#0088cc",      // override MD3 primary
        color: "#ffffff",                // override MD3 on-primary
        fontSize: "1rem",                // 16px text
        lineHeight: 1,
        textTransform: "none",           // keep your casing
      }}
    >
      <TelegramIcon 
        style={{ 
          fontSize: "1.2rem",            // 19px icon to align with text 
          verticalAlign: "middle" 
        }} 
      />
      <span style={{ lineHeight: 1 }}>Follow {category} on Telegram</span>
    </md-filled-button>
  );
}
