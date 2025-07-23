// routes/bidRoutes.js
import express from "express";
import * as bidController from "../controllers/bidController.js";

const router = express.Router();

router.post("/", bidController.createBid);
router.get("/MyBids", bidController.viewUserBids);
router.delete("/:bid_id", bidController.deleteBid);
router.get("/MyListingsBids", bidController.viewBidsOnUserListings);

export default router;