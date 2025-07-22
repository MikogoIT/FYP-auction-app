// models/tagModel.js
import { sql } from "../utils/db.js";

export async function insertTagsToAuction(auctionId, tags) {
  for (const rawTag of tags) {
    if (typeof rawTag !== "string") continue;

    const tagName = rawTag.trim().toLowerCase();
    if (!tagName) continue;

    // Insert tag or ignore if it exists
    await sql`
      INSERT INTO tags (name) VALUES (${tagName})
      ON CONFLICT (name) DO NOTHING;
    `;

    const tagResult = await sql`
      SELECT id FROM tags WHERE name = ${tagName};
    `;

    if (!tagResult.length) {
      throw new Error(`Tag "${tagName}" could not be found or inserted`);
    }

    const tagId = tagResult[0].id;

    // Link tag to listing
    await sql`
      INSERT INTO auction_listing_tags (auction_id, tag_id)
      VALUES (${auctionId}, ${tagId})
      ON CONFLICT DO NOTHING;
    `;
  }
}

export async function getAllTags({ excludeCategoryName } = {}) {
  if (excludeCategoryName) {
    const result = await sql`
      SELECT DISTINCT t.name
      FROM tags t
      JOIN auction_listing_tags alt ON t.id = alt.tag_id
      JOIN auction_listings al ON alt.auction_id = al.id
      JOIN listing_categories lc ON al.category_id = lc.id
      WHERE LOWER(lc.name) != ${excludeCategoryName.toLowerCase()}
      ORDER BY t.name ASC;
    `;
    return result.map(row => row.name);
  }

  // Default: all tags
  const result = await sql`SELECT name FROM tags ORDER BY name ASC`;
  return result.map(row => row.name);
}

// get user's interested tags based on watchlist
export async function getUserInterestedTags(buyerId) {
  return sql`
    SELECT 
      t.id,
      t.name,
      COUNT(*) AS usage_count
    FROM watchlist wl
    JOIN auction_listing_tags alt ON wl.auction_id = alt.auction_id
    JOIN tags t ON alt.tag_id = t.id
    WHERE wl.buyer_id = ${buyerId}
    GROUP BY t.id, t.name
    ORDER BY usage_count DESC;
  `;
}

// get recommended items based on user's interested tags
export async function getTagBasedRecommendations(buyerId, limit = 10) {
  return sql`
    WITH user_tags AS (
      SELECT DISTINCT t.id as tag_id, t.name
      FROM watchlist wl
      JOIN auction_listing_tags alt ON wl.auction_id = alt.auction_id
      JOIN tags t ON alt.tag_id = t.id
      WHERE wl.buyer_id = ${buyerId}
    ),
    user_watchlist_items AS (
      SELECT auction_id
      FROM watchlist
      WHERE buyer_id = ${buyerId}
    ),
    tag_scores AS (
      SELECT 
        al.id as auction_id,
        COUNT(DISTINCT ut.tag_id) as matching_tags,
        STRING_AGG(DISTINCT ut.name, ', ') as matched_tag_names
      FROM auction_listings al
      JOIN auction_listing_tags alt ON al.id = alt.auction_id
      JOIN user_tags ut ON alt.tag_id = ut.tag_id
      WHERE al.is_active = true
        AND al.end_date > NOW()
        AND al.seller_id != ${buyerId}
        AND al.id NOT IN (SELECT auction_id FROM user_watchlist_items)
      GROUP BY al.id
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
      COUNT(b.id) AS bid_count,
      ts.matching_tags,
      ts.matched_tag_names
    FROM auction_listings al
    JOIN tag_scores ts ON al.id = ts.auction_id
    LEFT JOIN listing_categories lc ON al.category_id = lc.id
    LEFT JOIN users u ON al.seller_id = u.id
    LEFT JOIN bids b ON al.id = b.auction_id
    GROUP BY 
      al.id, al.title, al.description, al.min_bid, al.end_date, 
      al.category_id, lc.name, al.seller_id, u.username, al.image_url,
      al.auction_type, al.start_price, al.discount_percentage,
      ts.matching_tags, ts.matched_tag_names
    ORDER BY 
      ts.matching_tags DESC,
      bid_count DESC, 
      al.end_date ASC
    LIMIT ${limit};
  `;
}

// get tags for a specific auction
export async function getTagsForAuction(auctionId) {
  return sql`
    SELECT t.id, t.name
    FROM tags t
    JOIN auction_listing_tags alt ON t.id = alt.tag_id
    WHERE alt.auction_id = ${auctionId}
    ORDER BY t.name ASC;
  `;
}
