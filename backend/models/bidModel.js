// models/bidModel.js
import { sql } from "../utils/db.js";

export async function insertBid(buyerId, auctionId, bidAmount) {
  return await sql`
    INSERT INTO bids (buyer_id, auction_id, bid_amount)
    VALUES (${buyerId}, ${auctionId}, ${bidAmount})
    RETURNING *
  `;
}

export async function getMinAllowedBid(auctionId) {
  const result = await sql`
    SELECT 
      a.min_bid, 
      MAX(b.bid_amount) AS highest_bid
    FROM auction_listings a
    LEFT JOIN bids b ON a.id = b.auction_id
    WHERE a.id = ${auctionId}
    GROUP BY a.id
  `;
  return result[0];
}


// Get all bids + auction information of the current user
export async function getUserBidsWithListing(buyerId) {
  return await sql`
    SELECT 
      b.id AS bid_id,
      b.bid_amount,
      b.created_at,
      b.updated_at,
      b.status,
      a.title AS listing_name,
      a.end_time
    FROM bids b
    JOIN auction_listings a ON b.auction_id = a.id
    WHERE b.buyer_id = ${buyerId}
    ORDER BY b.created_at DESC
  `;
}

// Delete bid
export async function deleteUserBid(buyerId, bidId) {
  return await sql`
    DELETE FROM bids 
    WHERE id = ${bidId} AND buyer_id = ${buyerId}
    RETURNING *
  `;
}