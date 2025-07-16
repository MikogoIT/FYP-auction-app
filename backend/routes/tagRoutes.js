// routes/tagRoutes.js
import express from "express";
import * as tagController from "../controllers/tagController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.post("/tag", requireLogin, tagController.insertTagsWithListing);

export default router;
