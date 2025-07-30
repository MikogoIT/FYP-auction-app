// controllers/feedbackController.js
import {
  insertWebsiteFeedback,
  hasSubmittedFeedback,
  getAllWebsiteFeedback as fetchFeedback,
  getLatestWebsiteFeedback,
  submitFeedback,
  getFeedbackForUser,
  hasFeedback,
  getUserRatings as fetchUserRatings,
  retrieveWinnerInfo as fetchWinnerInfo,
  updateUserRatings
} from "../models/feedbackModel.js";


// POST   /feedback
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
    res.status(500).json({ message: 'Failed to submit feedback.' });
  }
}

// GET    /feedback/list
export async function getAllWebsiteFeedback(req, res) {
  try {
    // Optional: support sorting via query param
    const sortOption = req.query.sort || 'latest';
    const feedbacks = await fetchFeedback(sortOption);
    res.json(feedbacks);
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ message: 'Failed to fetch Website Feedback.' });
  }
}


// GET /feedback/recent
export async function getRecentFeedback(req, res) {
  try {
    const feedback = await getLatestWebsiteFeedback();
    res.json({ feedback });
  } catch (err) {
    console.error("Fetch recent feedback error:", err);
    res.status(500).json({ message: "Failed to fetch recent feedback." });
  }
}

// Create an auction review
export async function postAuctionFeedback(req, res) {
  try {
    const author_id = req.session.userId;
    const { auction_id, user_ratings, user_comments } = req.body;

    if (!author_id) {
      return res.status(401).json({ error: "You must be logged in to submit feedback." });
    }

    // Validate rating
    if (!Number.isInteger(user_ratings) || user_ratings < 1 || user_ratings > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Get winner info
    const [winnerInfo] = await fetchWinnerInfo(auction_id);
    if (!winnerInfo) {
      return res.status(404).json({ error: "Auction not found or has no winner." });
    }

    const buyer_id = winnerInfo.buyer_id;
    const seller_id = winnerInfo.seller_id;

    let recipient_id, author_role;
    if (author_id === buyer_id) {
      recipient_id = seller_id;
      author_role = "Buyer";
    } else if (author_id === seller_id) {
      recipient_id = buyer_id;
      author_role = "Seller";
    } else {
      return res.status(403).json({ error: "You are not part of this auction." });
    }

    // Prevent self-review
    if (author_id === recipient_id) {
      return res.status(400).json({ error: "Author and recipient cannot be the same user." });
    }

    // Prevent duplicate
    const alreadyReviewed = await hasFeedback(author_id, recipient_id, auction_id);
    if (alreadyReviewed) {
      return res.status(409).json({ error: "You have already submitted feedback for this auction." });
    }

    // Create feedback
    const feedback = await submitFeedback({
      author_id,
      recipient_id,
      auction_id,
      author_role,
      user_ratings,
      user_comments
    });

    if (!feedback.length) {
      return res.status(409).json({ error: "Feedback already submitted." });
    }

    // Update summary
    await updateUserRatings(recipient_id);

    res.status(201).json(feedback[0]);

  } catch (err) {
    console.error("Post auction feedback error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}


// Get the reviews received by a user
export async function getUserFeedback(req, res) {
  try {
    const userId = req.params.userId;
    const feedback = await getFeedbackForUser(userId);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}


export async function getUserRatings(req, res) {
  try {
    const userId = req.params.userId;
    const [ratings] = await fetchUserRatings(userId); // Destructure first row

    if (!ratings) {
      return res.json({
        user_id: userId,
        avg_rating: null,
        total_reviews: 0,
      });
    }

    res.json(ratings);
  } catch (err) {
    console.error("Get user ratings error:", err);
    res.status(500).json({ message: "Failed to fetch user ratings." });
  }
}
