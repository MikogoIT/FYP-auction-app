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

export async function getAllWebsiteFeedback(sortOption = "latest") {
  let orderByClause;

  switch (sortOption) {
    case "highest":
      orderByClause = sql`ORDER BY wf.website_ratings DESC`;
      break;
    case "lowest":
      orderByClause = sql`ORDER BY wf.website_ratings ASC`;
      break;
    case "latest":
    default:
      orderByClause = sql`ORDER BY wf.created_at DESC`;
      break;
  }

  return await sql`
    SELECT wf.user_id, u.username, u.profile_image_url, wf.website_ratings, wf.website_comments, wf.created_at
    FROM website_feedback wf
    JOIN users u ON u.id = wf.user_id
    ${orderByClause}
  `;

  /*
  return await sql`
    SELECT f.id, f.website_ratings, f.website_comments, f.created_at,
           u.username, u.profile_image_url
    FROM website_feedback f
    JOIN users u ON f.user_id = u.id
    ${orderByClause}
  `;
}

export async function getLatestWebsiteFeedback() {
  return await sql`
    SELECT
      f.id,
      f.website_ratings,
      f.website_comments,
      f.created_at,
      u.username,
      u.profile_image_url
    FROM website_feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT 4
  `;
}

  */
}

