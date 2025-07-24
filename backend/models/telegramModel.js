// models/telegramModel.js
import { sql } from "../utils/db.js";
import { getMyListings } from "../models/listingsModel.js"

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
            COALESCE(MAX(b.bid_amount), 0) AS highest_bid,
            ta.telegram_id AS seller_telegram_id,
            COALESCE(string_agg(t.name, ', ' ORDER BY t.name), '') AS tags
        FROM auction_listings al
        JOIN listing_categories lc ON al.category_id = lc.id
        LEFT JOIN bids b ON al.id = b.auction_id
        LEFT JOIN telegram_accounts ta ON al.seller_id = ta.user_id
        LEFT JOIN auction_listing_tags alt ON al.id = alt.auction_id
        LEFT JOIN tags t ON alt.tag_id = t.id
        WHERE al.posted_to_telegram = FALSE AND al.is_active = TRUE
        GROUP BY al.id, lc.name, ta.telegram_id
        ORDER BY al.id ASC
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

export async function getBidsByUserId(userId) {
    const result = await sql`
        SELECT
            b.*,
            al.title AS listing_title,
            al.end_date,
            al.auction_type
        FROM bids b
        JOIN auction_listings al on b.auction_id = al.id
        WHERE b.buyer_id = ${userId}
        ORDER BY b.created_at DESC
    `;

    return result;
}

export async function getSellerListingsByUserId(userId) {
    return getMyListings(userId);
}

export async function getUnsentNotifications() {
    return await sql`
        SELECT n.*, ta.telegram_id
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        JOIN telegram_accounts ta ON u.id = ta.user_id
        WHERE n.sent_to_telegram = FALSE
        ORDER BY n.created_at ASC
    `;
}

export async function markNotificationSent(notificationId) {
    await sql`
        UPDATE notifications
        SET sent_to_telegram = TRUE
        WHERE id = ${notificationId}
    `;
}

export async function deleteUserBid(buyerId, auctionId) {
    return await sql`
        DELETE from bids
        WHERE buyer_id =${buyerId} AND auction_id = ${auctionId}
        RETURNING *
    `;
}

// Search based on user's input via GPT-LLM
export async function searchListingsWithFilters(category, maxPrice, keywordsCsv) {
    // Convert keywordCsv ("nike, blue") to array
    const keywords = keywordsCsv
        ? keywordsCsv.split(",").map(k => k.trim()).filter(k => k)
        : [];

    // Build dynamic keyword conditions
    const keywordConditions = keywords.length
        ? sql`AND (${sql.join(
            keywords.map(k => sql`(l.title ILIKE ${'%' + k + '%'} OR l.description ILIKE ${'%' + k + '%'})`),
            sql` OR`
        )})`
        : sql``;

    return await sql`
        SELECT 
            l.*,
            lc.name AS category_name,
            COALESCE(MAX(b.bid_amount), l.min_bid) AS current_bid
        FROM auction_listings l
        JOIN listing_categories lc ON lc.id = l.category_id
        LEFT JOIN bids b ON l.id = b.auction_id
        WHERE l.is_active = TRUE
            AND (
                ${category} = ''
                OR lc.name ILIKE ${category}
            )
            AND (
                ${maxPrice}::numeric IS NULL
                OR COALESCE(MAX(b.bid_amount), l.min_bid) <= ${maxPrice}
            )
            ${keywordConditions}
        GROUP BY l.id, lc.name
        ORDER BY l.end_date ASC
    `;
}

// Save or update telegram message info for a listing
export async function saveTelegramMessage(auctionId, messageId, channelId, caption) {
    const result = await sql`
        INSERT INTO telegram_messages (auction_id, message_id, channel_id, caption)
        VALUES (${auctionId}, ${messageId}, ${channelId}, ${caption})
        ON CONFLICT (auction_id)
        DO UPDATE SET
            message_id = EXCLUDED.message_id,
            channel_id = EXCLUDED.channel_id,
            caption = EXCLUDED.caption,
            last_updated = NOW()
        RETURNING *
    `;

    return result[0];
}

// Get telegram message info by auction id
export async function getTelegramMessageByAuctionId(auctionId) {
    const result = await sql`
        SELECT * FROM telegram_messages WHERE auction_id = ${auctionId}
    `;

    return result[0];
}

// Get listings with telegram messages info (for the bot to fetch)
export async function getListingsWithTelegramMessages() {
    return await sql`
        SELECT al.*, tm.message_id, tm.channel_id, tm.caption
        FROM auction_listings al
        JOIN telegram_messages tm ON al.id = tm.auction_id
        WHERE al.is_active = TRUE
        ORDER BY al.end_date ASC
    `;
}