// controllers/feedbackController.js
import {
  insertWebsiteFeedback,
  hasSubmittedFeedback,
  getAllWebsiteFeedback as fetchFeedback,
  getLatestWebsiteFeedback
} from "../models/feedbackModel.js";

export async function submitWebsiteFeedback(req, res) {
  const userId = req.session.userId;
  const { website_comments, website_ratings } = req.body;

  // 1. Authentication check
  if (!userId) {
    return res.status(401).json({ message: 'You must be logged in to submit feedback.' });
  }

  // 2. Validation
  if (!website_comments?.trim()) {
    return res.status(400).json({ message: 'Feedback cannot be empty.' });
  }
  if (!website_ratings || website_ratings < 1 || website_ratings > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // 3. Prevent duplicate submissions
    const alreadySubmitted = await hasSubmittedFeedback(userId);
    if (alreadySubmitted) {
      return res.status(409).json({ message: 'You have already submitted feedback.' });
    }

    // 4. Insert feedback
    await insertWebsiteFeedback(userId, website_ratings, website_comments);
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (err) {
    console.error(`Feedback submission error (userId: ${userId}):`, err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getAllWebsiteFeedback(req, res) {
  try {
    // Optional: support sorting via query param
    const sortOption = req.query.sort || 'latest';
    const feedbacks = await fetchFeedback(sortOption);
    res.json(feedbacks);
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


// GET /feedback/recent
export async function getRecentFeedback(req, res) {
  try {
    const feedback = await getLatestWebsiteFeedback();
    res.json({ feedback });
  } catch (err) {
    console.error("Fetch recent feedback error:", err);
    res.status(500).json({ message: "Failed to fetch recent feedback" });
  }
}
