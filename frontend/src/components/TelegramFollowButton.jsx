import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
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
        <Button
            variant="contained"
            color="primary"
            onClick={handleFollow}
            startIcon={<TelegramIcon />}
        >
            Follow on Telegram
        </Button>
    );
}