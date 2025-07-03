// models/feedbackModel.js
import { sql } from "../utils/db.js";

export async function insertWebsiteFeedback(user_id, website_ratings, website_comments) {
  return await sql`
    INSERT INTO website_feedback (user_id, website_ratings, website_comments)
    VALUES (${user_id}, ${website_ratings}, ${website_comments})
    ON CONFLICT (user_id)
    DO UPDATE SET
      website_ratings = EXCLUDED.website_ratings,
      website_comments = EXCLUDED.website_comments,
      updated_at = NOW();
  `;
}

export async function getAllWebsiteFeedback() {
  return await sql`
    SELECT f.id, f.website_ratings, f.website_comments, f.created_at, u.username
    FROM website_feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;
}

