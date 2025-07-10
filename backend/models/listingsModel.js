// models/listingsModel.js
import { sql } from "../utils/db.js";

export const createListing = async (
  sellerId,
  title,
  description,
  min_bid,
  end_date,
  category_id,
  auction_type = "ascending",
  start_price = null,
  discount_steps = null,
  discount_percentages = null,
  step_duration = null
) => {
  return await sql`
    INSERT INTO auction_listings (
      seller_id, title, description, min_bid, end_date, category_id,
      auction_type, start_price, discount_steps, discount_percentages, step_duration
    )
    VALUES (
      ${sellerId}, ${title}, ${description}, ${min_bid}, ${end_date}, ${category_id},
      ${auction_type}, ${start_price}, ${discount_steps}, ${discount_percentages}, ${step_duration}
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
      l.id, l.title, l.description, l.min_bid, l.end_date,
      l.auction_type, l.start_price, l.discount_steps, l.discount_percentages, l.step_duration,
      l.category_id, l.seller_id, l.image_url, l.is_active, l.posted_to_telegram,
      l.created_at,
      MAX(b.bid_amount) AS current_bid
    FROM auction_listings l
    LEFT JOIN bids b ON l.id = b.auction_id
    WHERE l.id = ${id}
    GROUP BY 
      l.id, l.title, l.description, l.min_bid, l.end_date,
      l.auction_type, l.start_price, l.discount_steps, l.discount_percentages, l.step_duration,
      l.category_id, l.seller_id, l.image_url, l.is_active, l.posted_to_telegram,
      l.created_at
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
  discount_steps = null,
  discount_percentages = null,
  step_duration = null
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
      discount_steps = ${discount_steps},
      discount_percentages = ${discount_percentages},
      step_duration = ${step_duration}
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
    ORDER BY l.end_date ASC
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
    ORDER BY l.end_date ASC
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
      discount_steps,
      discount_percentages,
      step_duration,
      end_date,
      created_at
    FROM auction_listings
    WHERE id = ${listingId}
  `;
  if (!result[0] || result[0].auction_type !== "descending") return null;

  const {
    start_price,
    discount_steps,
    discount_percentages,
    step_duration,
    end_date,
    created_at
  } = result[0];

  let discounts = discount_percentages;
  if (typeof discounts === "string") {
    try {
      discounts = JSON.parse(discounts);
    } catch {
      discounts = [];
    }
  }

  // calculate current price based on time elapsed
  const now = new Date();
  const start = created_at ? new Date(created_at) : new Date(now.getTime() - (discount_steps * step_duration * 1000));
  const elapsedSeconds = Math.floor((now - start) / 1000);
  const stepsPassed = Math.min(
    Math.floor(elapsedSeconds / step_duration),
    discount_steps
  );

  // apply each step discount
  let price = Number(start_price);
  for (let i = 0; i < stepsPassed && i < discounts.length; i++) {
    price = price * (1 - discounts[i] / 100);
  }
  // keep two decimal places
  price = Math.max(price, 0).toFixed(2);

  return Number(price);
}