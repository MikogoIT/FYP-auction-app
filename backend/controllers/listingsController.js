// controllers/listingsModel.js
import {
  createListing,
  getActiveListings,
  getListingById,
  getSellerId,
  updateListing,
  deleteListing,
  getMyListings
} from "../models/listingsModel.js";
import { verifyToken } from "../utils/token.js";

// POST /listings
export async function postListing(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  const { title, description, min_bid, end_date, category_id } = req.body;
  if (!title || !min_bid || !end_date || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await createListing(payload.userId, title, description, min_bid, end_date, category_id);
    res.status(201).json({ listing: result[0] });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
}

// GET /listings
export async function getListings(req, res) {
  try {
    const listings = await getActiveListings();
    res.json({ listings });
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

// GET /listings/:id
export async function getListing(req, res) {
  try {
    const result = await getListingById(req.params.id);
    if (result.length === 0) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing: result[0] });
  } catch (err) {
    console.error("Fetch listing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
}

// PUT /listings/:id
export async function putListing(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  const { title, description, min_bid, end_date } = req.body;
  if (!title || !min_bid || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(payload.userId)) {
      return res.status(403).json({ message: "Unauthorized to edit this listing" });
    }

    await updateListing(req.params.id, title, description, min_bid, end_date);
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
}

// DELETE /listings/:id
export async function deleteListingById(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    const existing = await getSellerId(req.params.id);
    if (existing.length === 0) return res.status(404).json({ message: "Listing not found" });
    if (Number(existing[0].seller_id) !== Number(payload.userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this listing" });
    }

    await deleteListing(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
}

// GET /mylistings
export async function getMyListingsHandler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    const listings = await getMyListings(payload.userId);
    res.json({ listings });
  } catch (err) {
    console.error("Fetch my listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

export async function getRecentListings(req, res) {
  try {
    const result = await sql`
      SELECT l.*, u.username AS seller
      FROM auction_listings l
      JOIN users u ON l.seller_id = u.id
      WHERE is_active = true
      ORDER BY end_date ASC
      LIMIT 5
    `;
    res.json({ listings: result });
  } catch (err) {
    console.error("Fetch recent listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

export async function getAllListings(req, res) {
  const { q = "", category = "" } = req.query;

  try {
    const listings = await getListingsWithFilters(q, category);
    res.json({ listings });
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}