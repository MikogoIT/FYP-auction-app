// routes/tagRoutes.js
import express from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

// POST   /feedback       (requires login)
router.post(  "/",  requireLogin,  feedbackController.submitWebsiteFeedback);


export default router;
