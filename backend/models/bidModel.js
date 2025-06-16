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
