import { insertWebsiteFeedback, hasSubmittedFeedback} from "../models/feedbackModel.js";

export async function submitWebsiteFeedback(req, res) {
  const userId = req.session.userId;
  const { website_comments, website_ratings } = req.body;

  if (!website_comments?.trim()) {
    return res.status(400).json({ message: "Feedback cannot be empty." });
  }

  if (!website_ratings || website_ratings < 1 || website_ratings > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    const alreadySubmitted = await hasSubmittedFeedback(userId);

    if (alreadySubmitted) {
      return res.status(409).json({ message: "You have already submitted feedback." });
    }

    await insertWebsiteFeedback(userId, website_ratings, website_comments);
    res.status(201).json({ message: "Feedback submitted" });

  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
