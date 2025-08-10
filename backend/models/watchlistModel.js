import { sql } from "../utils/db.js";

// add to watchlist
export async function addToWatchlist(buyerId, auctionId) {
  return sql`
    INSERT INTO watchlist (buyer_id, auction_id)
    VALUES (${buyerId}, ${auctionId})
    ON CONFLICT DO NOTHING;
  `;
}

// get list, including separate current_price & highest_bid columns
export async function getWatchlistByBuyer(buyerId) {
  return await sql`
    SELECT
      l.id            AS auction_id,   -- <— new
      l.*,                             
      u.username     AS seller,
      MAX(b.bid_amount)  AS current_bid
    FROM watchlist wl
    JOIN auction_listings l
      ON wl.auction_id = l.id
    JOIN users u
      ON l.seller_id = u.id
    LEFT JOIN bids b
      ON b.auction_id = l.id
    WHERE wl.buyer_id = ${buyerId}
      AND l.is_active = true
    GROUP BY l.id, u.username
    ORDER BY l.created_at DESC
  `;
}


// delete 
export async function removeFromWatchlist(buyerId, auctionId) {
  return sql`
    DELETE FROM watchlist
    WHERE buyer_id = ${buyerId} AND auction_id = ${auctionId}
    RETURNING *;
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
      al.is_active,
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
      AND NOT EXISTS (SELECT 1 FROM user_watchlist_items WHERE auction_id = al.id)
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