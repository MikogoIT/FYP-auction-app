// controllers/tagController.js
import { insertTagsToAuction , getAllTags as fetchTags } from "../models/tagModel.js";

// POST /tag
export async function insertTagsWithListing(req, res) {
  const userId = req.session.userId;
  const { auction_id, tags } = req.body;

  // 1. Check login
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  // 2. Validate input
  if (!auction_id || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ message: 'auction_id and tags are required.' });
  }

  try {
    await insertTagsToAuction(auction_id, tags);
    res.status(201).json({ message: "Tags successfully linked to auction." });
  } catch (err) {
    console.error("insertTagsWithListing error:", err);
    res.status(500).json({ message: "Server error while inserting tags." });
  }
}

// GET /tag
export async function fetchTags(req, res) {
  try {
    const tags = await getAllTags(); 
    res.json({ tags });
  } catch (err) {
    console.error("Failed to fetch tags:", err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
}