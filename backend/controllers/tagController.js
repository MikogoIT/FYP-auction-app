// controllers/tagController.js
import { 
  insertTagsToAuction, 
  getAllTags, 
  getUserInterestedTags, 
  getTagBasedRecommendations,
  getTagsForAuction 
} from "../models/tagModel.js";

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
export async function fetchTagsForAutocomplete(req, res) {
  try {
    const tags = await getAllTags({ excludeCategoryName: "general" });
    res.json({ tags });
  } catch (err) {
    console.error("Failed to fetch autocomplete tags:", err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
}

// GET /tag/user-interests
export async function fetchUserInterestedTags(req, res) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const tags = await getUserInterestedTags(userId);
    res.json({ tags });
  } catch (err) {
    console.error("Failed to fetch user interested tags:", err);
    res.status(500).json({ message: "Failed to fetch user interested tags" });
  }
}

// GET /tag/recommendations
export async function fetchTagBasedRecommendations(req, res) {
  const userId = req.session.userId;
  const limit = parseInt(req.query.limit) || 10;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const recommendations = await getTagBasedRecommendations(userId, limit);
    res.json({ recommendations });
  } catch (err) {
    console.error("Failed to fetch tag-based recommendations:", err);
    res.status(500).json({ message: "Failed to fetch tag-based recommendations" });
  }
}

// GET /tag/auction/:auctionId
export async function fetchTagsForAuction(req, res) {
  const { auctionId } = req.params;

  if (!auctionId) {
    return res.status(400).json({ message: 'Auction ID is required' });
  }

  try {
    const tags = await getTagsForAuction(auctionId);
    res.json({ tags });
  } catch (err) {
    console.error("Failed to fetch tags for auction:", err);
    res.status(500).json({ message: "Failed to fetch tags for auction" });
  }
}