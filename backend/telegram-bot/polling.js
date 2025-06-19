import TelegramBot from "node-telegram-bot-api";
import { formatListingMessage } from "./formatListingMessage.js";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

export async function pollForListingsAndPost() {
    try {
        const BASE_URL = "";

        // Fetch unposted listings from your backend API
        const res = await fetch(`${BASE_URL}/api/telegram/listings/unposted`, {
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

            const { text, options } = formatListingMessage(listing, listing.category_name);

            await bot.sendMessage(channelUsername, text, options);

            // Mark as posted
            await fetch(`${BASE_URL}/api/telegram/mark-posted/${listing.id}`, {
                method: "POST",
            });
        }
    } catch (err) {
        console.error("Error posting listing: ", err.message);
    }
}

setInterval(pollForListingsAndPost, 5 * 60 * 1000);