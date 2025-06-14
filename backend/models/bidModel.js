// models/bidModel.js
import { sql } from "../utils/db.js";

export async function insertBid(buyerId, auctionId, bidAmount) {
  return await sql`
    INSERT INTO bids (buyer_id, auction_id, bid_amount)
    VALUES (${buyerId}, ${auctionId}, ${bidAmount})
    RETURNING *
  `;
}
