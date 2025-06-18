// models/telegramModel.js
import { sql } from "../utils/db.js";

export async function linkTelegramToUser(userId, telegramId, telegramUsername) {
    await sql`
        INSERT INTO telegram_accounts (user_id, telegram_id, telegram_username)
        VALUES (${userId}, ${telegramId}, ${telegramUsername})
        ON CONFLICT (user_id)
        DO UPDATE SET
            telegram_id = EXCLUDED.telegram_id,
            telegram_username = EXCLUDED.telegram_username,
            linked_at = CURRENT_TIMESTAMP
    `;
}

export async function getTelegramLinkStatus(userId) {
    const result = await sql`
        SELECT telegram_username FROM telegram_accounts WHERE user_id = ${userId}
    `;
    return result[0]; // undefined if not linked
}