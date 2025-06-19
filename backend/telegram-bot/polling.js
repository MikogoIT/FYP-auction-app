import TelegramBot from "node-telegram-bot-api";
import { formatListingMessage } from "./formatListingMessage.js";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

const backendApiUrl = process.env.BACKEND_API_URL || "http://host.docker.internal:8080";

export async function pollForListingsAndPost() {
    try {
        // Fetch unposted listings from your backend API
        const res = await fetch(`${backendApiUrl}/api/telegram/listings/unposted`, {
            headers: { Authorization: `Bearer ${process.env.BOT_SECRET}` },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const listings = await res.json();

        for (const listing of listings) {
            // Telegram channel "name" e.g. @shoes_fypauction --> same as invite link t.me/shoes_fypauction
            // but prepend with "@"
            const channelUsername = `@${listing.category_name.toLowerCase()}_fypauction`;
            const { photoUrl, caption, options } = formatListingMessage(listing, listing.category_name);

            try {
                await bot.sendPhoto(channelUsername, photoUrl, { caption, ...options });

                // Mark as posted
                await fetch(`${backendApiUrl}/api/telegram/mark-posted/${listing.id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${process.env.BOT_SECRET}` },
                });
            } catch (err) {
                // Skip if chat not found
                if (err.response?.body?.description?.includes("chat not found")) {
                    console.warn(`Skipping listing ${listing.id}: Telegram channel not found (${channelUsername})`);
                    continue;
                }

                // Log other errors
                console.error(`Error posting listing ${listing.id}: `, err.message);
            }
        }
    } catch (err) {
        console.error("Error posting listing: ", err.message);
    }
}

setInterval(pollForListingsAndPost, 5 * 60 * 1000);

// Run once immediately on start for quick test
pollForListingsAndPost();