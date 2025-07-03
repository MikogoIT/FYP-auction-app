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
