// controllers/feedbackController.js
import { insertWebsiteFeedback } from "../models/feedbackModel.js";
import { getAllWebsiteFeedback as fetchFeedback } from "../models/feedbackModel.js";

export async function submitWebsiteFeedback(req, res) {
  const userId = req.session.userId;
  const { website_comments, website_ratings } = req.body;

  if (!website_comments?.trim()) {
    return res.status(400).json({ message: "Feedback cannot be empty." });
  }

  if (!website_ratings || website_ratings < 1 || website_ratings > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  // Check if feedback already exists
  const existing = await sql`
    SELECT id FROM website_feedback WHERE user_id = ${userId}
  `;

  if (existing.length > 0) {
    return res.status(409).json({ message: "Feedback already submitted." });
  }

  try {
    await insertWebsiteFeedback(userId, website_ratings, website_comments);
    res.status(201).json({ message: "Feedback submitted" });
  } catch (err) {
    console.error("Feedback insert error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getAllWebsiteFeedback(req, res) {
  try {
    const feedbacks = await fetchFeedback();
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
}