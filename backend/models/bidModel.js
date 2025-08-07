// models/bidModel.js
import { sql } from "../utils/db.js";

export async function insertBid(buyerId, auctionId, bidAmount) {
  return await sql`
    INSERT INTO bids (buyer_id, auction_id, bid_amount)
    VALUES (${buyerId}, ${auctionId}, ${bidAmount})
    ON CONFLICT (buyer_id, auction_id)
    DO UPDATE SET
      bid_amount = EXCLUDED.bid_amount,
      updated_at = CURRENT_TIMESTAMP,
      status = 'pending'
    RETURNING *;
  `;
}

export async function getAuctionMinBid(auctionId) {
  const result = await sql`
    SELECT 
      a.min_bid, 
      COALESCE(MAX(b.bid_amount), 0) AS highest_bid
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
      a.end_date
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

export async function getBidsOnUserListings(sellerId) {
  return await sql`
    SELECT
      b.id               AS bid_id,
      b.bid_amount,
      b.created_at       AS bid_created_at,
      b.updated_at       AS bid_updated_at,
      b.status,
      b.buyer_id,
      u.username         AS buyer_name,

      a.id               AS listing_id,
      a.title            AS listing_name,
      a.image_url        AS listing_image_url,
      a.start_price,
      a.min_bid,
      a.end_date         AS listing_end_date,
      a.auction_type,
      a.is_active

    FROM bids b
    JOIN auction_listings a
      ON b.auction_id = a.id
    JOIN users u
      ON b.buyer_id = u.id

    WHERE a.seller_id = ${sellerId}
    ORDER BY b.created_at DESC
  `;
}

// Mark all other bids as outbid
export async function markOthersOutbid(auctionId, buyerId) {
  return await sql`
    UPDATE bids
    SET status = 'outbid', updated_at = CURRENT_TIMESTAMP
    WHERE auction_id = ${auctionId}
      AND buyer_id <> ${buyerId}
      AND status != 'outbid';
  `;
}

// Delete Bid
export async function getAuctionIdByBid(bid_id, userId){
  return await sql`
      SELECT auction_id
      FROM bids
      WHERE buyer_id = ${userId}
      AND id = ${bid_id};
  `;
}

export async function findTopBid(auctionId){
  return await sql`
      SELECT id ,buyer_id , bid_amount
      FROM bids
      WHERE auction_id = ${auctionId}
      ORDER BY bid_amount DESC, created_at ASC
      LIMIT 1;
  `;
}

export async function setBidPending(bidId) {
  await sql`
    UPDATE bids
    SET status = 'pending'
    WHERE id = ${bidId};
  `;
}