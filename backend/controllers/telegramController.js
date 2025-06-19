// controllers/telegramController.js
import * as telegramModel from "../models/telegramModel.js";

export async function linkTelegramAccount(req, res) {
    const { telegram_id, telegram_username } = req.body;
    const userId = req.session.userId;

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

