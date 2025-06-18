// controllers/telegramController.js
import { linkTelegramToUser, getTelegramLinkStatus, unlinkTelegramFromUser } from "../models/telegramModel.js";
import { verifyToken } from "../utils/token.js";

export async function linkTelegramAccount(req, res) {
    const { token, telegram_id, telegram_username } = req.body;

    // Verify token
    const tokenData = verifyToken(token);
    if (!tokenData || !tokenData.userId) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = parseInt(tokenData.userId);

    // Link Telegram to user
    try {
        await linkTelegramToUser(userId, telegram_id, telegram_username);
        res.json({ message: "Telegram account linked successfully" });
    } catch (err) {
        console.error("Telegram linking error: ", err);
        res.status(500).json({ message: "Failed to link Telegram account" });
    }
}

export async function getTelegramStatus(req, res) {
    const { token } = req.body;
    const tokenData = verifyToken(token);
    if (!tokenData || !tokenData.userId) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const result = await getTelegramLinkStatus(parseInt(tokenData.userId));
    if (result) {
        res.json({ linked: true, telegram_username: result.telegram_username });
    } else {
        res.json({ linked: false });
    }
}

export async function unlinkTelegramAccount(req, res) {
    const { token } = req.body;
    const tokenData = verifyToken(token);

    if (!tokenData || !tokenData.userId) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        await unlinkTelegramFromUser(parseInt(tokenData.userId));
        res.json({ message: "Telegram account unlinked successfully" });
    } catch (err) {
        console.error("Unlinking error: ", err);
        res.status(500).json({ message: "Failed to unlink Telegram account" });
    }
}