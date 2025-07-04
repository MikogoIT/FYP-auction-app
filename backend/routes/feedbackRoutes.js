// routes/feedbackRoutes.js
import express from "express";
import { submitWebsiteFeedback } from "../controllers/feedbackController.js";
import { getAllWebsiteFeedback } from "../controllers/feedbackController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();


router.post("/", requireLogin, submitWebsiteFeedback);
router.get("/list", getAllWebsiteFeedback);

export default router;
