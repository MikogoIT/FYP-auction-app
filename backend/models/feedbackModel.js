// models/feedbackModel.js
import { sql } from "../utils/db.js";

// Create Website Feedback
export async function insertWebsiteFeedback(user_id, website_ratings, website_comments) {
  return await sql`
    INSERT INTO website_feedback (user_id, website_ratings, website_comments)
    VALUES (${user_id}, ${website_ratings}, ${website_comments})
  `;
}

// Checking for submitted feedback previously
export async function hasSubmittedFeedback(user_id) {
  const result = await sql`
    SELECT 1 FROM website_feedback WHERE user_id = ${user_id} LIMIT 1
  `;
  return result.length > 0;
}

// Get All Website Feedback
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

// Get Latest Website Feedback
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
    LIMIT 3
  `;
}

// Submit User Auction Feedback
export async function submitFeedback({ author_id, recipient_id, auction_id, author_role, user_ratings, user_comments }) {
  return await sql`
    UPDATE user_feedback
    SET 
      user_ratings = ${user_ratings},
      user_comments = ${user_comments},
      status = 'completed'
    WHERE author_id = ${author_id}
      AND recipient_id = ${recipient_id}
      AND auction_id = ${auction_id}
      AND author_role = ${author_role}
    RETURNING *;
  `;
}

/*

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

*/

// Checks For Feedback 'Completion' Status
export async function hasFeedback(author_id, recipient_id, auction_id) {
  const result = await sql`
    SELECT 1 
    FROM user_feedback 
    WHERE author_id = ${author_id} 
      AND recipient_id = ${recipient_id} 
      AND auction_id = ${auction_id}
      AND status = 'completed'
    LIMIT 1;
  `;
  return result.length > 0;
}




// Fetch User Ratings from Rating Table
export async function getUserRatings(userId) {
  return await sql`
    SELECT
      user_id,
      avg_rating,
      total_reviews
    FROM user_ratings
    WHERE user_id = ${userId}
  `;
}

// Fetch Auction Winner Row Info
export async function retrieveWinnerInfo(auction_id){
    return await sql`
      SELECT seller_id, buyer_id
      FROM auction_winner
      WHERE auction_id = ${auction_id}
      LIMIT 1;
    `;
}

// Update recipient's rating summary after new feedback
export async function updateUserRatings(recipient_id) {
  return await sql`
    INSERT INTO user_ratings (user_id, avg_rating, total_reviews, total_rating_points, updated_at)
    SELECT
      recipient_id AS user_id,
      ROUND(AVG(user_ratings)::numeric, 1) AS avg_rating,
      COUNT(*) AS total_reviews,
      SUM(user_ratings) AS total_rating_points,
      CURRENT_TIMESTAMP
    FROM user_feedback
    WHERE recipient_id = ${recipient_id}
    GROUP BY recipient_id
    ON CONFLICT (user_id) DO UPDATE 
    SET 
        avg_rating = EXCLUDED.avg_rating,
        total_reviews = EXCLUDED.total_reviews,
        total_rating_points = EXCLUDED.total_rating_points,
        updated_at = CURRENT_TIMESTAMP;
  `;
}



/*INSERT INTO user_ratings (user_id, avg_rating, total_reviews, total_rating_points, updated_at)
SELECT
    recipient_id AS user_id,
    ROUND(AVG(user_ratings)::numeric, 1) AS avg_rating,
    COUNT(*) AS total_reviews,
    SUM(user_ratings) AS total_rating_points,
    CURRENT_TIMESTAMP
FROM user_feedback
GROUP BY recipient_id
ON CONFLICT (user_id) DO UPDATE 
SET 
    avg_rating = EXCLUDED.avg_rating,
    total_reviews = EXCLUDED.total_reviews,
    total_rating_points = EXCLUDED.total_rating_points,
    updated_at = CURRENT_TIMESTAMP;
*/


