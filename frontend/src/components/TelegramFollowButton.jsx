import React, { useEffect, useState } from "react";
import TelegramIcon from "@mui/icons-material/Telegram";

// Utility function to construct channel name
const getChannelUrl = (category) => {
    const baseName = category.toLowerCase().replace(/\s+/g, "_");
    const suffix = "fypauction";
    return `https://t.me/${baseName}_${suffix}`;
}

export default function TelegramFollowButton({ category }) {
    const channelUrl = getChannelUrl(category);

    const handleFollow = () => {
        window.open(channelUrl, "_blank");
    };

    return (
        <md-filled-button
        onClick={(e) => {
            e.stopPropogation();
            handleFollow();
        }}
        style={{ 
            flexGrow: 1, 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            "--md-sys-color-primary": "#0088cc",
            "--md-sys-color-on-primary": "#ffffff"
        }}
        >
            <TelegramIcon style={{ fontSize: "1.2rem" }} />
            Follow on Telegram
        </md-filled-button>
    );
}