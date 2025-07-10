import { sql } from "../utils/db.js";

// insert notification
export async function insertNotification(userId, auctionId, content) {
  return await sql`
    INSERT INTO notifications (user_id, auction_id, content, is_read)
    VALUES (${userId}, ${auctionId}, ${content}, FALSE)
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

export async function hasRecentNotification(userId, auctionId, minutes = 15, contentLike = null) {
  const intervalStr = `${minutes} minutes`;
  let query, params;
  if (contentLike) {
    query = `
      SELECT 1 FROM notifications
      WHERE user_id = $1
        AND auction_id = $2
        AND created_at > NOW() - INTERVAL '${intervalStr}'
        AND content LIKE $3
    `;
    params = [userId, auctionId, `%${contentLike}%`];
  } else {
    query = `
      SELECT 1 FROM notifications
      WHERE user_id = $1
        AND auction_id = $2
        AND created_at > NOW() - INTERVAL '${intervalStr}'
    `;
    params = [userId, auctionId];
  }
  const result = await sql.query(query, params);
  return result.length > 0;
}