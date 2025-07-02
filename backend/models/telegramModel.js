// models/telegramModel.js
import { sql } from "../utils/db.js";

export async function linkTelegramToUser(userId, telegramId, telegramUsername) {
    const result = await sql`
        INSERT INTO telegram_accounts (user_id, telegram_id, telegram_username)
        VALUES (${userId}, ${telegramId}, ${telegramUsername})
        ON CONFLICT (user_id)
        DO UPDATE SET
            telegram_id = EXCLUDED.telegram_id,
            telegram_username = EXCLUDED.telegram_username,
            linked_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    console.log(result);
}

export async function getTelegramLinkStatus(userId) {
    const result = await sql`
        SELECT telegram_username FROM telegram_accounts WHERE user_id = ${userId}
    `;
    return result[0]; // undefined if not linked
}

export async function unlinkTelegramFromUser(userId) {
    await sql`
        DELETE FROM telegram_accounts WHERE user_id = ${userId}
    `;
}

// Retrieve any ACTIVE listings that have NOT been 
// posted to Telegram but exist in database
export async function getUnpostedListings() {
    return await sql`
        SELECT 
            al.*, 
            lc.name AS category_name,
            COALESCE(MAX(b.bid_amount), 0) AS highest_bid
        FROM auction_listings al
        JOIN listing_categories lc ON al.category_id = lc.id
        LEFT JOIN bids b ON al.id = b.auction_id
        WHERE al.posted_to_telegram = FALSE AND al.is_active = TRUE
        GROUP BY al.id, lc.name
    `;
}

// Mark a listing after it is posted to Telegram
export async function markListingAsPosted(listingId) {
    await sql`
        UPDATE auction_listings
        SET posted_to_telegram = TRUE
        WHERE id = ${listingId}
    `;
}

export async function getTelegramAccountsByTelegramId(telegramId) {
    const result = await sql`
        SELECT user_id FROM telegram_accounts WHERE telegram_id = ${telegramId}
    `;

    return result[0];
}