// models/listingsModel.js
import { sql } from "../utils/db.js";

export const createListing = async (
  sellerId,
  title,
  description,
  min_bid,
  end_date,
  category_id,
  auction_type,
  start_price,
  discount_percentage
) => {
  return await sql`
    INSERT INTO auction_listings (
      seller_id, title, description, min_bid, end_date, category_id,
      auction_type, start_price, discount_percentage
    )
    VALUES (
      ${sellerId}, ${title}, ${description}, ${min_bid}, ${end_date}, ${category_id},
      ${auction_type}, ${start_price}, ${discount_percentage}
    )
    RETURNING *
  `;
};

export const getActiveListings = async () => {
  return await sql`
    SELECT 
      l.id, 
      l.title, 
      l.description, 
      l.min_bid, 
      l.end_date, 
      l.seller_id, 
      u.username AS seller,
      MAX(b.bid_amount) AS current_bid
    FROM auction_listings l
    JOIN users u ON l.seller_id = u.id
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.is_active = true
    GROUP BY 
      l.id, l.title, l.description, l.min_bid, l.end_date, l.seller_id, u.username
    ORDER BY l.end_date ASC

  `;
};


export const getListingById = async (id) => {
  return await sql`
    SELECT 
      a.id,
      a.title,
      a.description,
      a.min_bid,
      a.end_date,
      a.auction_type,
      a.start_price,
      a.discount_percentage,
      a.category_id,
      c.name             AS category_name,
      a.seller_id,
      u.username         AS seller_username,
      u.profile_image_url AS seller_avatar,
      a.image_url,
      a.is_active,
      a.posted_to_telegram,
      a.created_at
    FROM auction_listings a
    LEFT JOIN listing_categories c
      ON c.id = a.category_id
    JOIN users u
      ON u.id = a.seller_id
    WHERE a.id = ${id};
  `;
};


export const getSellerId = async (id) => {
  return await sql`
    SELECT seller_id FROM auction_listings WHERE id = ${id}
  `;
};

export const updateListing = async (
  id,
  title,
  description,
  min_bid,
  end_date,
  auction_type = "ascending",
  start_price = null,
  discount_percentage = null 
) => {
  return await sql`
    UPDATE auction_listings
    SET 
      title = ${title},
      description = ${description},
      min_bid = ${min_bid},
      end_date = ${end_date},
      auction_type = ${auction_type},
      start_price = ${start_price},
      discount_percentage = ${discount_percentage}
    WHERE id = ${id}
  `;
};

export const deleteListing = async (id) => {
  return await sql`
    DELETE FROM auction_listings WHERE id = ${id}
  `;
};

export const getMyListings = async (userId) => {
  return await sql`
    SELECT 
      l.*,
      c.name AS category_name,
      MAX(b.bid_amount) AS current_bid
    FROM auction_listings l
    LEFT JOIN listing_categories c ON l.category_id = c.id
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.seller_id = ${userId}
    GROUP BY l.id, c.name
    ORDER BY l.created_at ASC
  `;
};

export async function getListingsWithFilters(searchTerm, categoryId) {
  return await sql`
    SELECT 
      l.*, 
      u.username AS seller,
      MAX(b.bid_amount) AS current_bid
    FROM auction_listings l
    JOIN users u ON l.seller_id = u.id
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.is_active = true
      AND (${searchTerm} = '' OR l.title ILIKE ${'%' + searchTerm + '%'} OR l.description ILIKE ${'%' + searchTerm + '%'})
      AND (${categoryId} = '' OR l.category_id::text = ${categoryId})
    GROUP BY l.id, u.username
    ORDER BY l.end_date ASC
  `;
}

export async function getRecentListings(limit = 5) {
  return await sql`
    SELECT 
      l.*, 
      u.username AS seller,
      MAX(b.bid_amount) AS current_bid
    FROM auction_listings l
    JOIN users u ON l.seller_id = u.id
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.is_active = true
    GROUP BY l.id, u.username
    ORDER BY l.created_at DESC
    LIMIT ${limit}
  `;
}

/**
 * get current descending price for a listing
 * @param {number} listingId
 * @returns {number|null} current price or null if not a descending auction
 */
export async function getCurrentDescendingPrice(listingId) {
  const result = await sql`
    SELECT 
      auction_type,
      start_price,
      min_bid,
      discount_percentage,
      created_at,
      end_date
    FROM auction_listings
    WHERE id = ${listingId}
  `;
  if (!result[0] || result[0].auction_type !== "descending") return null;

  const {
    start_price,
    min_bid,
    discount_percentage,
    created_at,
    end_date
  } = result[0];

  // step duration in seconds
  const step_duration = 60;

  const now = new Date();
  const start = new Date(created_at);
  const end = new Date(end_date);

  // if auction has not started yet
  if (now >= end) return Number(min_bid);

  // calculate elapsed time since auction started
  const elapsedSeconds = Math.floor((now - start) / 1000);
  let stepsPassed = Math.floor(elapsedSeconds / step_duration);

  // calculate current price
  let price = Number(start_price);
  for (let i = 0; i < stepsPassed; i++) {
    price = price * (1 - Number(discount_percentage) / 100);
    if (price <= min_bid) {
      price = Number(min_bid);
      break;
    }
  }
  // ensure price does not go below min_bid
  price = Math.max(price, Number(min_bid));
  return Number(price.toFixed(2));
}

// returns top 5 listings with most bids
export async function getTrendingListings(limit = 5) {
  return await sql`
    SELECT
      l.*,
      COUNT(b.id) AS bid_count
    FROM auction_listings l
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.is_active = true
    GROUP BY l.id
    ORDER BY bid_count DESC
    LIMIT ${limit}
  `;
}

// returns listing title, buyer & seller info plus auction cover image, and the raw IDs
export async function getAuctionPeople(auctionId) {
  return await sql`
    SELECT
      l.title                      AS listing_title,
      aw.seller_id                 AS seller_id,
      aw.buyer_id                  AS buyer_id,
      buyer.username               AS buyer_username,
      buyer.profile_image_url      AS buyer_profile_image_url,
      seller.username              AS seller_username,
      seller.profile_image_url     AS seller_profile_image_url,
      l.image_url                  AS auction_image_url
    FROM auction_winner aw
    JOIN users            AS buyer  ON aw.buyer_id  = buyer.id
    JOIN users            AS seller ON aw.seller_id = seller.id
    JOIN auction_listings AS l      ON aw.auction_id = l.id
    WHERE aw.auction_id = ${auctionId}
    LIMIT 1
  `;
}


