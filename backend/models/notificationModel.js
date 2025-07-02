import { sql } from "../utils/db.js";

// insert notification
export async function insertNotification(userId, content) {
  return await sql`
    INSERT INTO notifications (user_id, content, is_read)
    VALUES (${userId}, ${content}, FALSE)
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