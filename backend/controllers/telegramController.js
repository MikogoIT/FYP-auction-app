// controllers/telegramController.js
import * as telegramModel from "../models/telegramModel.js";
import { insertBid, getAuctionMinBid } from "../models/bidModel.js";
import { isTelegramDataValid } from "../utils/telegramUtils.js";

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
        const minBidData = await getAuctionMinBid(auction_id);
        if (!minBidData) {
            return res.status(404).json({ message: "Auction not found" });
        }

        const minBid = Math.max(minBidData.min_bid, minBidData.highest_bid || 0);

        if (parseFloat(bid_amount) < minBid) {
            return res.status(400).json({ message: `Bid must be at least $${minBid}` });
        }

        // Insert the bid
        const bid = await insertBid(user_id, auction_id, bid_amount);
        return res.status(201).json({ bid: bid[0] });
    } catch (err) {
        console.error("Bid creation error: ", err);
        return res.status(500).json({ message: "Failed to place bid" });
    }
}

