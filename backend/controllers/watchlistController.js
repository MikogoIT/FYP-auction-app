import {
  addToWatchlist,
  getWatchlistByBuyer,
  removeFromWatchlist,
  isAlreadyInWatchlist,
  getRecommendedItems,
  getUserInterestedCategories
} from "../models/watchlistModel.js";
import { getTagBasedRecommendations } from "../models/tagModel.js";
import { getTrendingListings } from "../models/listingsModel.js";

// add to watch list
export async function handleAddToWatchlist(req, res) {
  const userId = req.session.userId;
  const { auction_id } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const exists = await isAlreadyInWatchlist(userId, auction_id);
    if (exists) {
      return res.status(400).json({ message: "Item already in watchlist" });
    }

    await addToWatchlist(userId, auction_id);
    res.status(201).json({ message: "Added to watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Error adding to watchlist", error: err });
  }
}

// get all list
export async function handleGetWatchlist(req, res) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const watchlist = await getWatchlistByBuyer(userId);
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving watchlist", error: err });
  }
}

// delete product
export async function handleRemoveFromWatchlist(req, res) {
  const userId = req.session.userId;
  const { auction_id } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await removeFromWatchlist(userId, auction_id);
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Error removing from watchlist", error: err });
  }
}

// get recommended items based on user's watchlist categories
export async function handleGetRecommendedItems(req, res) {
  const userId = req.session.userId;
  const limit = parseInt(req.query.limit) || 10;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const recommendedItems = await getRecommendedItems(userId, limit);
    res.json(recommendedItems);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving recommended items", error: err });
  }
}

// get user's interested categories based on watchlist
export async function handleGetUserInterestedCategories(req, res) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const categories = await getUserInterestedCategories(userId);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving interested categories", error: err });
  }
}

// get comprehensive recommendations (both category and tag-based)
export async function handleGetComprehensiveRecommendations(req, res) {
  const userId = req.session.userId;
  const limit = parseInt(req.query.limit) || 20;
  const categoryLimit = Math.ceil(limit * 0.6); // 60% category-based
  const tagLimit = Math.ceil(limit * 0.4); // 40% tag-based

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get both category-based and tag-based recommendations
    const [categoryRecommendations, tagRecommendations] = await Promise.all([
      getRecommendedItems(userId, categoryLimit),
      getTagBasedRecommendations(userId, tagLimit)
    ]);

    // Combine and deduplicate recommendations
    const seenIds = new Set();
    const combinedRecommendations = [];

    // Add category-based recommendations first
    categoryRecommendations.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        combinedRecommendations.push({
          ...item,
          recommendation_type: 'category'
        });
      }
    });

    // Add tag-based recommendations
    tagRecommendations.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        combinedRecommendations.push({
          ...item,
          recommendation_type: 'tag'
        });
      }
    });

    // Limit to requested number
    let finalRecommendations = combinedRecommendations.slice(0, limit);

    // Add fallback to trending if nothing found
    if (finalRecommendations.length === 0) {
      const trending = await getTrendingListings(limit);
      finalRecommendations = trending.map(item => ({
        ...item,
        recommendation_type: 'trending'
      }));
    }

    res.json({
      recommendations: finalRecommendations,
      total: finalRecommendations.length,
      category_count: finalRecommendations.filter(r => r.recommendation_type === 'category').length,
      tag_count: finalRecommendations.filter(r => r.recommendation_type === 'tag').length,
      trending_count: finalRecommendations.filter(r => r.recommendation_type === "trending").length,
    });
  } catch (err) {
    console.error("Error getting comprehensive recommendations:", err);
    res.status(500).json({ message: "Error retrieving comprehensive recommendations", error: err });
  }
}