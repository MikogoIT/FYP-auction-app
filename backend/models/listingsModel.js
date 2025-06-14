// models/listingsModel.js
import { sql } from "../utils/db.js";

export const createListing = async (sellerId, title, description, min_bid, end_date) => {
  return await sql`
    INSERT INTO auction_listings (seller_id, title, description, min_bid, end_date)
    VALUES (${sellerId}, ${title}, ${description}, ${min_bid}, ${end_date})
    RETURNING *
  `;
};

export const getActiveListings = async () => {
  return await sql`
    SELECT l.id, l.title, l.description, l.min_bid, l.end_date, l.seller_id, u.username AS seller
    FROM auction_listings l
    JOIN users u ON l.seller_id = u.id
    WHERE l.is_active = true
    ORDER BY l.end_date ASC
  `;
};

export const getListingById = async (id) => {
  return await sql`
    SELECT id, title, description, min_bid, end_date
    FROM auction_listings
    WHERE id = ${id}
  `;
};

export const getSellerId = async (id) => {
  return await sql`
    SELECT seller_id FROM auction_listings WHERE id = ${id}
  `;
};

export const updateListing = async (id, title, description, min_bid, end_date) => {
  return await sql`
    UPDATE auction_listings
    SET title = ${title}, description = ${description}, min_bid = ${min_bid}, end_date = ${end_date}
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
    SELECT id, title, description, min_bid, end_date
    FROM auction_listings
    WHERE seller_id = ${userId}
    ORDER BY end_date ASC
  `;
};
