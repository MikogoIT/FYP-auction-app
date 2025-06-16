import { sql } from "../utils/db.js";

export async function getAuctionMinBid(auctionId) {
  const result = await sql`
    SELECT min_bid FROM auction_listings WHERE id = ${auctionId}
  `;
  return result.length > 0 ? result[0].min_bid : null;
}
