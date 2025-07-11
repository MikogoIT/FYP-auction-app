import { sql } from "../utils/db.js";

export async function getAuctionMinBid(auctionId) {
  const result = await sql`
    SELECT min_bid FROM auction_listings WHERE id = ${auctionId}
  `;
  return result.length > 0 ? result[0].min_bid : null;
}

export async function getEndedAscendingAuctions() {
  return await sql`
    SELECT id, title, seller_id FROM auction_listings
    WHERE auction_type = 'ascending'
      AND end_date <= (NOW() AT TIME ZONE 'Asia/Singapore')
      AND is_active = true
  `;
}

export async function getHighestBidderForAuction(auctionId) {
  const result = await sql`
    SELECT buyer_id, bid_amount FROM bids
    WHERE auction_id = ${auctionId}
    ORDER BY bid_amount DESC, created_at ASC
    LIMIT 1;
  `;
  return result[0];
}
