import { sql } from "../utils/db.js";

// insert notification
export async function insertNotification(userId, content) {
  return await sql`
    INSERT INTO notifications (user_id, listing_id, content, is_read)
    VALUES (${userId}, ${listingId}, ${content}, FALSE)
    RETURNING *;
  `;
}

export async function getUnreadNotifications(userId) {
  return await sql`
    SELECT * FROM notifications
    WHERE user_id = ${userId} AND is_read = FALSE
    ORDER BY created_at DESC;
  `;
}


export async function markNotificationsAsRead(userId) {
  return await sql`
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = ${userId};
  `;
}

export async function hasRecentNotification(userId, listingId, minutes = 15) {
  const result = await sql`
    SELECT 1 FROM notifications
    WHERE user_id = ${userId}
      AND listing_id = ${listingId}
      AND created_at > NOW() - INTERVAL '${minutes} minutes'
  `;
  return result.length > 0;
}