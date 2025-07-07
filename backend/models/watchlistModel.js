import { sql } from "../utils/db.js";

// add to watchlist
export async function addToWatchlist(buyerId, auctionId) {
  return sql`
    INSERT INTO watchlist (buyer_id, auction_id)
    VALUES (${buyerId}, ${auctionId})
    ON CONFLICT DO NOTHING;
  `;
}

// get list, now including category name
export async function getWatchlistByBuyer(buyerId) {
  return sql`
    SELECT
      wl.*,
      al.title,
      al.description,
      al.min_bid,
      al.end_date,
      al.category_id,
      lc.name AS category_name
    FROM watchlist wl
    JOIN auction_listings al
      ON wl.auction_id = al.id
    LEFT JOIN listing_categories lc
      ON al.category_id = lc.id
    WHERE wl.buyer_id = ${buyerId};
  `;
}


// delete 
export async function removeFromWatchlist(buyerId, auctionId) {
  return sql`
    DELETE FROM watchlist
    WHERE buyer_id = ${buyerId} AND auction_id = ${auctionId};
  `;
}

// check if exist
export async function isAlreadyInWatchlist(buyerId, auctionId) {
  const result = await sql`
    SELECT 1 FROM watchlist
    WHERE buyer_id = ${buyerId} AND auction_id = ${auctionId}
    LIMIT 1;
  `;
  return result.length > 0;
}