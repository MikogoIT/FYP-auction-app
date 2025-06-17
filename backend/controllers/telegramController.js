// controllers/telegramController.js
import { isTelegramDataValid } from "../utils/telegramUtils";
import db from "../utils/db.js";

export async function linkTelegram(req, res) {
    const telegramUser = req.body;

    const isValid = isTelegramDataValid(telegramUser, process.env.TELEGRAM_BOT_TOKEN);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid Telegram data" });
    }

    const userId = req.user.id; // JWT Token (need to check this)

    try {
        await db.User.update(
            {
                telegram_id: telegramUser.id,
                telegram_username: telegramUser.username,
            },
            { where: { id: userId } }
        );

        res.json({ message: "Telegram account linked!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}