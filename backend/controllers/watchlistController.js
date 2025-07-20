import {
  addToWatchlist,
  getWatchlistByBuyer,
  removeFromWatchlist,
  isAlreadyInWatchlist,
  getRecommendedItems,
  getUserInterestedCategories
} from "../models/watchlistModel.js";

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