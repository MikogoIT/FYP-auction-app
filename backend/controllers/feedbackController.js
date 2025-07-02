import { insertWebsiteFeedback } from "../models/feedbackModel.js";

export async function submitWebsiteFeedback(req, res) {
  const userId = req.session.userId;
  const { website_comments, website_ratings } = req.body;
  if (!website_comments || !website_comments.trim()) {
    return res.status(400).json({ message: "Feedback cannot be empty." });
  }
  if (!website_ratings || website_ratings < 1 || website_ratings > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }
  try {
    await insertWebsiteFeedback(userId, website_ratings, website_comments);
    res.status(201).json({ message: "Feedback submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
