// models/feedbackModel.js
import { sql } from "../utils/db.js";

export async function insertWebsiteFeedback(user_id, website_ratings, website_comments) {
  return await sql`
    INSERT INTO website_feedback (user_id, website_ratings, website_comments)
    VALUES (${user_id}, ${website_ratings}, ${website_comments})
  `;
}

export async function hasSubmittedFeedback(user_id) {
  const result = await sql`
    SELECT 1 FROM website_feedback WHERE user_id = ${user_id} LIMIT 1
  `;
  return result.length > 0;
}
