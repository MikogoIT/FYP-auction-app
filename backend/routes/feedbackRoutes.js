import express from "express";
import { submitWebsiteFeedback } from "../controllers/feedbackController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.post("/feedback", requireLogin, submitWebsiteFeedback);

export default router;
