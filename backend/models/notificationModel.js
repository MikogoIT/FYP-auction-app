import { sql } from "../utils/db.js";

// insert notification
export async function insertNotification(userId, listingId, content) {
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
  const intervalStr = `${minutes} minutes`;
  const query = `
    SELECT 1 FROM notifications
    WHERE user_id = $1
      AND listing_id = $2
      AND created_at > NOW() - INTERVAL '${intervalStr}'
  `;
  const result = await sql.query(query, [userId, listingId]);
  return result.length > 0;
}