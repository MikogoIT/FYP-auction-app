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
      orderByClause = sql`ORDER BY f.website_ratings DESC`;
      break;
    case "lowest":
      orderByClause = sql`ORDER BY f.website_ratings ASC`;
      break;
    case "latest":
    default:
      orderByClause = sql`ORDER BY f.created_at DESC`;
      break;
  }

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

// User auction feedback
export async function createFeedback({ author_id, recipient_id, auction_id, author_role, user_ratings, user_comments }) {
  return await sql`
    INSERT INTO user_feedback (author_id, recipient_id, auction_id, author_role, user_ratings, user_comments)
    VALUES (${author_id}, ${recipient_id}, ${auction_id}, ${author_role}, ${user_ratings}, ${user_comments})
    RETURNING *;
  `;
}

export async function getFeedbackForUser(userId) {
  return await sql`
    SELECT * FROM user_feedback WHERE recipient_id = ${userId} ORDER BY created_at DESC;
  `;
}

export async function getFeedbackForAuction(auctionId) {
  return await sql`
    SELECT * FROM user_feedback WHERE auction_id = ${auctionId} ORDER BY created_at DESC;
  `;
}

export async function hasFeedback(author_id, recipient_id, auction_id) {
  const result = await sql`
    SELECT 1 FROM user_feedback WHERE author_id = ${author_id} AND recipient_id = ${recipient_id} AND auction_id = ${auction_id};
  `;
  return result.length > 0;
}
