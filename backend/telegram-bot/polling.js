import TelegramBot from "node-telegram-bot-api";
import { formatListingMessage } from "./formatListingMessage.js";

// Starts instance of Telegram Bot and allows it to listen for user message
// (mostly for the private chats)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const backendApiUrl = process.env.BACKEND_API_URL || "http://host.docker.internal:8080";


// Command handlers
const userBidContext = new Map(); // Map<chatId, auctionId>

// When user starts via payload
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const payload = match[1];
    
    if (payload && payload.startsWith("bid_")) {
        const auctionId = payload.split("_")[1];
        userBidContext.set(chatId, auctionId); // Track what item user is bidding on
        bot.sendMessage(chatId, `Welcome! You're viewing item #${auctionId}.`);
    } else {
        bot.sendMessage(chatId, "Welcome to Auctioneer!");
    }
    sendHelp(chatId);
});

bot.onText(/\/help/, (msg) => {
    sendHelp(msg.chat.id);
});

// When user types /bid <amount>
bot.onText(/\/bid (\d+(\.\d+)?)/, (msg, match) => {
  const chatId = msg.chat.id;
  const bidAmount = parseFloat(match[1]);
  if (isNaN(bidAmount)) {
    bot.sendMessage(chatId, "Please provide a valid bid amount, e.g. /bid 100");
  } else {
    bot.sendMessage(chatId, `You've placed a bid of $${bidAmount.toFixed(2)}. (Backend integration coming soon!)`);
  }
});

function sendHelp(chatId) {
    const helpText = `
Available commands:
/help - Shows this help message
/bid <amount> - Place a bid
/listings - Show active listings
    `;
    bot.sendMessage(chatId, helpText);
}

// Populate any listings on website but not on Telegram channel
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

            // Skip if no image URL
            if (!listing.image_url || listing.image_url.trim() === "") {
                console.warn(`Skipping listing ${listing.id}: No photo provided`);
                continue;
            }

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