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

export async function getAuctionMetadata(auctionId) {
  const result = await sql`
    SELECT auction_type, min_bid, start_price, current_price
    FROM auction_listings
    WHERE id = ${auctionId}
  `;

  return result[0] || null;
}

export async function getAuctionBidDetails(auctionId) {
  const [listing] = await sql`
    SELECT auction_type, min_bid, start_price, discount_percentage
    FROM auction_listings
    WHERE id = ${auctionId}
  `;

  if (!listing) return null;

  const [highestBidRow] = await sql`
    SELECT COALESCE(MAX(bid_amount), 0) AS highest_bid
    FROM bids
    WHERE auction_id = ${auctionId}
  `;

  return {
    ...listing,
    highest_bid: highestBidRow.highest_bid
  };
}

export async function getLowestBid(auctionId) {
  const result = await sql`
    SELECT bid_amount
    FROM bids
    WHERE auction_id = ${auctionId}
    ORDER BY bid_amount ASC, created_at ASC
    LIMIT 1
  `;

  return result.length > 0 ? parseFloat(result[0].bid_amount) : null;
}