// routes/feedbackRoutes.js
import express from "express";
import { submitWebsiteFeedback } from "../controllers/feedbackController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.post("/", requireLogin, submitWebsiteFeedback);

export default router;
