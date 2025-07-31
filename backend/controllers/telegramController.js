// controllers/telegramController.js
import * as telegramModel from "../models/telegramModel.js";
import * as watchlistModel from "../models/watchlistModel.js";
import { insertBid, getAuctionMinBid } from "../models/bidModel.js";
import { getSellerId, getTrendingListings } from "../models/listingsModel.js";
import { getTagBasedRecommendations } from "../models/tagModel.js";
import { getAuctionMetadata, getLowestBid } from "../models/auctionModel.js";
import { isTelegramDataValid, getTeleBotIdTokenClient } from "../utils/telegramUtils.js";

export async function linkTelegramAccount(req, res) {
    const telegramData = req.body;
    const userId = req.session.userId;

    // Verify Telegram login data is authentic
    const isValid = isTelegramDataValid(telegramData, process.env.TELEGRAM_BOT_TOKEN);
    if (!isValid) {
        return res.status(403).json({ message: "Invalid Telegram login data" });
    }

    const { id: telegram_id, username: telegram_username } = telegramData;

    // Link Telegram to user
    try {
        await telegramModel.linkTelegramToUser(userId, telegram_id, telegram_username);
        res.json({ message: "Telegram account linked successfully" });
    } catch (err) {
        console.error("Telegram linking error: ", err);
        res.status(500).json({ message: "Failed to link Telegram account" });
    }
}

export async function getTelegramStatus(req, res) {
    const userId = req.session.userId;

    try {
        const result = await telegramModel.getTelegramLinkStatus(userId);
        if (result) {
            res.json({ linked: true, telegram_username: result.telegram_username });
        } else {
            res.json({ linked: false });
        }
    } catch (err) {
        console.error("Status check error: ", err);
        res.status(500).json({ message: "Failed to check Telegram status" });
    }
}

export async function unlinkTelegramAccount(req, res) {
    const userId = req.session.userId;

    try {
        await telegramModel.unlinkTelegramFromUser(userId);
        res.json({ message: "Telegram account unlinked successfully" });
    } catch (err) {
        console.error("Unlinking error: ", err);
        res.status(500).json({ message: "Failed to unlink Telegram account" });
    }
}

export async function handleTelegramWebhook(req, res) {
    try {
        // Optional: verify Telegram secret token
        const tgSecret = req.headers["x-telegram-bot-api-secret-token"];
        if (tgSecret !== process.env.BOT_SECRET) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const botUrl = "https://auctioneer-tele-bot-fy2crkvg3a-as.a.run.app/webhook";

        const client = await getTeleBotIdTokenClient(botUrl);

        // Forward to the bot backend
        const botResponse = await client.request({
            url: botUrl,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-telegram-bot-api-secret-token": tgSecret,
            },
            data: req.body,
        });

        if (!botResponse.status || botResponse.status >= 400) {
            console.error("Forwarding failed: ", botResponse.data);
            return res.status(500).json({ error: "Forwarding failed", detail: botResponse.data });
        }

        return res.status(200).json({ message: "Forwarded to bot" });
    } catch (err) {
        console.error("Webhook handler error: ", err);
        return res.status(500).json({ error: "Unexpected error", detail: err.message });
    }
}

export async function fetchUnpostedListings(req, res) {
    try {
        const result = await telegramModel.getUnpostedListings();
        res.json(result);
    } catch (err) {
        console.error("Failed to fetch unposted listings: ", err);
        res.status(500).json({ message: "Error retrieving unposted listings." })
    }
}

export async function markListingPosted(req, res) {
    const { listingId } = req.params;

    try {
        await telegramModel.markListingAsPosted(listingId);
        res.status(200).json({ message: "Listing marked as posted" });
    } catch (err) {
        console.error("Error marking listing as posted: ", err);
        res.status(500).json({ message: "Failed to mark listing as posted" });
    }
}

export async function checkTelegramAccount(req, res) {
    const telegramUserId = req.params.telegramUserId;

    if (!telegramUserId) {
        return res.status(400).json({ linked: false, error: "Missing telegramUserId" });
    }

    try {
        const linkedAccount = await telegramModel.getTelegramAccountsByTelegramId(telegramUserId);

        if (linkedAccount) {
            return res.json({ 
                linked: true,
                user_id: linkedAccount.user_id
            });
        } else {
            return res.json({ linked: false })
        }
    } catch (err) {
        console.error("Error checking telegram account: ", err);
        return res.status(500).json({ linked: false, error: "Server error" });
    }
}

export async function createBidFromTelegram(req, res) {
    const { user_id, auction_id, bid_amount } = req.body;

    if (!user_id || !auction_id || !bid_amount) {
        return res.status(400).json({ message: "Missing bid information" });
    }

    try {
        // Get seller_id for this auction
        const [sellerRow] = await getSellerId(auction_id);
        if (!sellerRow) {
            return res.status(404).json({ message: "Auction not found" });
        }

        const sellerId = sellerRow.seller_id;
        if (sellerId === user_id) {
            return res.status(403).json({ message: "You cannot bid on your own listing." });
        }

        // Fetch auction metadata
        const auctionInfo = await getAuctionMetadata(auction_id);

        if (!auctionInfo) {
            return res.status(404).json({ message: "Auction not found" })
        }

        const { auction_type, min_bid, start_price, current_price } = auctionInfo;
        const bidAmount = parseFloat(bid_amount);
        if (isNaN(bidAmount)) {
            return res.status(400).json({ message: "Invalid bid amount" })
        }

        // Bid validation per auction type
        if (auction_type === "ascending") {

            const minBidData = await getAuctionMinBid(auction_id);
            const currentMinBid = Math.max(minBidData.min_bid, minBidData.highest_bid || 0);

            if (bidAmount <= currentMinBid) {
                return res.status(400).json({ message: `Bid must be higher than current price ($${currentMinBid})` });
            }
        } else if (auction_type === "descending") {
            // Use current_price as the reference price for descending auction bids

            if (current_price !== null && current_price !== undefined && bidAmount >= current_price) {
                return res.status(400).json({ message: `Bid must be lower than current price ($${current_price})` })
            }

            if (bidAmount < min_bid) {
                return res.status(400).json({ message: `Bid must be at least the minimum allowed ($${min_bid})` });
            }

        } else {
            return res.status(400).json({ message: "Unsupported auction type" });
        }

        // Insert the bid
        const bid = await insertBid(user_id, auction_id, bidAmount);
        return res.status(201).json({ 
            bid: bid[0],
            auction_type,
            updated_price: auction_type === "descending"
                ? (await getLowestBid(auction_id)) ?? start_price
                : bidAmount,
        });
    } catch (err) {
        console.error("Bid creation error: ", err);
        return res.status(500).json({ message: "Failed to place bid" });
    }
}

export async function getBidsByTelegramUser(req, res) {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
    }

    try {
        const bids = await telegramModel.getBidsByUserId(userId);

        // If no bids found, can return empty array
        res.json({ bids });
    } catch (err) {
        console.error("Error fetching bids for user: ", err);
        res.status(500).json({ message: "Failed to fetch bids" });
    }
}

export async function getSellerListings(req, res) {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
    }

    try {
        const listings = await telegramModel.getSellerListingsByUserId(userId);

        // If no listings found, can return empty array
        return res.json({ listings });
    } catch (err) {
        console.error("Error fetching seller listings:", err);
        return res.status(500).json({ message: "Failed to fetch seller listings" });
    }
}

export async function fetchUnsentNotifications(req, res) {
    try {
        const notifications = await telegramModel.getUnsentNotifications();
        res.json(notifications);
    } catch (err) {
        console.error("Failed to fetch unsent notifications: ", err);
        res.status(500).json({ message: "Error fetching notifications" });
    }
}

export async function markNotificationAsSent(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Notification ID required" });

    try {
        await telegramModel.markNotificationSent(id);
        res.json({ message: "Notification marked as sent" });
    } catch (err) {
        console.error("Failed to mark notification as sent: ", err);
        res.status(500).json({ message: "Error marking notification as sent" });
    }
}

export async function withdrawBidFromTelegram(req, res) {
    const { user_id, auction_id } = req.body;

    if (!user_id || !auction_id) {
        return res.status(400).json({ message: "Missing user_id or auction_id" });
    }

    try {
        const deleted = await telegramModel.deleteUserBid(user_id, auction_id);

        if (deleted.length === 0) {
            return res.status(404).json({ message: "No active bid found for withdrawal" });
        }

        return res.status(200).json({ message: "Bid withdrawn successfully. A 5% fee wil be incurred." })
    } catch (err) {
        console.error("Error withdrawing bid: ", err);
        return res.status(500).json({ message: "Server error while withdrawing bid" });
    }
}

export async function searchListings(req, res) {
    const {
        category = "",
        max_price = null,
        keywords = ""
    } = req.query;

    try {
        const listings = await telegramModel.searchListingsWithFilters(
            category,
            max_price ? parseFloat(max_price) : null,
            keywords
        );
        res.json({ listings })
    } catch (err) {
        console.error("Error searching listings: ", err);
        res.status(500).json({ message: "Failed to search listings" });
    }
}

export async function fetchListingsWithTelegramMessages(req, res) {
    try {
        const listings = await telegramModel.getListingsWithTelegramMessages();
        res.json(listings);
    } catch (err) {
        console.error("Failed to fetch listings with telegram messages: ", err);
        res.status(500).json({ message: "Failed to fetch listings" });
    }
}

export async function saveTelegramMessageData(req, res) {
    const { auctionId, messageId, channelId, caption } = req.body;

    if (!auctionId || !messageId || !channelId || !caption) {
        return res.status(400).json({ message: "Missing required data" });
    }

    try {
        const saved = await telegramModel.saveTelegramMessage(auctionId, messageId, channelId, caption);
        res.json({ message: "Telegram message info saved", data: saved });
    } catch (err) {
        console.error("Failed to save telegram message info: ", err);
        res.status(500).json({ message: "Failed to save telegram message info" });
    }
}

export async function addWatchlistItem(req, res) {
    const { user_id, auction_id } = req.body;
    if (!user_id || !auction_id) {
        return res.status(400).json({ message: "Missing user_id or auction_id" });
    }

    try {
        const alreadyExists = await watchlistModel.isAlreadyInWatchlist(user_id, auction_id);
        if (alreadyExists) {
            return res.status(409).json({ message: "Already in Watchlist" }); // 409 Conflict
        }

        await watchlistModel.addToWatchlist(user_id, auction_id);
        res.status(201).json({ message: "Added to Watchlist" });
    } catch (err) {
        console.error("Add watchlist error: ", err);
        res.status(500).json({ message: "Failed to add to watchlist" });
    }
}

export async function removeWatchlistItem(req, res) {
    const { user_id, auction_id } = req.body;
    if (!user_id || !auction_id) {
        return res.status(400).json({ message: "Missing user_id or auction_id" });
    }

    try {
        const deleted = await watchlistModel.removeFromWatchlist(user_id, auction_id);
        if (deleted.length === 0) {
            return res.status(404).json({ message: "Item not found in watchlist" });
        }
        res.json({ message: "Removed from watchlist" });
    } catch (err) {
        console.error("Remove watchlist error: ", err);
        res.status(500).json({ message: "Failed to remove from watchlist" });
    }
}

export async function getUserWatchlist(req, res) {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
    }
    
    try {
        const listings = await watchlistModel.getWatchlistByBuyer(userId);
        res.json({ listings });
    } catch (err) {
        console.error("Get watchlist error: ", err);
        res.status(500).json({ message: "Failed to get watchlist" });
    }
}

export async function getComprehensiveRecommendationsByUserId(req, res) {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 5;

    if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
    }

    try {
        const categoryLimit = Math.ceil(limit * 0.6);
        const tagLimit = Math.ceil(limit * 0.4);

        const [categoryRecommendations, tagRecommendations] = await Promise.all([
            watchlistModel.getRecommendedItems(userId, categoryLimit),
            getTagBasedRecommendations(userId, tagLimit),
        ]);

        const seenIds = new Set();
        const combinedRecommendations = [];

        for (const item of categoryRecommendations) {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                combinedRecommendations.push({ ...item, recommendation_type: "category" });
            }
        }

        for (const item of tagRecommendations) {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                combinedRecommendations.push({ ...item, recommendation_type: "tag" });
            }
        }

        let final = combinedRecommendations.slice(0, limit);

        // Fallback if no recommendations found (user has no watchlist)
        if (final.length === 0) {
            const trending = await getTrendingListings(limit);
            final = trending.map(item => ({
                ...item,
                recommendation_type: "trending"
            }));
        }

        res.json({
            recommendations: final,
            total: final.length,
            category_count: final.filter(r => r.recommendation_type === "category").length,
            tag_count: final.filter(r => r.recommendation_type === "tag").length,
            trending_count: final.filter(r => r.recommendation_type === "trending").length,
        });
    } catch (err) {
        console.error("Error getting recommendations by User ID: ", err);
        res.status(500).json({ message: "Internal server error" });
    }
}