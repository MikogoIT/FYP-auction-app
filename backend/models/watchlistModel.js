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

// get recommended items based on user's watchlist categories
export async function getRecommendedItems(buyerId, limit = 10) {
  return sql`
    WITH user_categories AS (
      SELECT DISTINCT al.category_id
      FROM watchlist wl
      JOIN auction_listings al ON wl.auction_id = al.id
      WHERE wl.buyer_id = ${buyerId}
    ),
    user_watchlist_items AS (
      SELECT auction_id
      FROM watchlist
      WHERE buyer_id = ${buyerId}
    )
    SELECT DISTINCT
      al.id,
      al.title,
      al.description,
      al.min_bid,
      al.end_date,
      al.category_id,
      lc.name AS category_name,
      al.seller_id,
      u.username AS seller_name,
      al.image_url,
      al.auction_type,
      al.start_price,
      al.discount_percentage,
      MAX(b.bid_amount) AS current_bid,
      COUNT(b.id) AS bid_count
    FROM auction_listings al
    JOIN user_categories uc ON al.category_id = uc.category_id
    LEFT JOIN listing_categories lc ON al.category_id = lc.id
    LEFT JOIN users u ON al.seller_id = u.id
    LEFT JOIN bids b ON al.id = b.auction_id
    WHERE al.is_active = true
      AND al.end_date > NOW()
      AND al.seller_id != ${buyerId}
      AND al.id NOT IN (SELECT auction_id FROM user_watchlist_items)
    GROUP BY 
      al.id, al.title, al.description, al.min_bid, al.end_date, 
      al.category_id, lc.name, al.seller_id, u.username, al.image_url,
      al.auction_type, al.start_price, al.discount_percentage
    ORDER BY 
      bid_count DESC, 
      al.end_date ASC
    LIMIT ${limit};
  `;
}

// get user's interested categories based on watchlist
export async function getUserInterestedCategories(buyerId) {
  return sql`
    SELECT 
      lc.id,
      lc.name,
      COUNT(*) AS watchlist_count
    FROM watchlist wl
    JOIN auction_listings al ON wl.auction_id = al.id
    JOIN listing_categories lc ON al.category_id = lc.id
    WHERE wl.buyer_id = ${buyerId}
    GROUP BY lc.id, lc.name
    ORDER BY watchlist_count DESC;
  `;
}