// routes/listingRoutes.js
import express from "express";
import * as listingsController from "../controllers/listingsController.js";

const router = express.Router();

router.post("/listings", listingsController.postListing);
router.get("/listings", listingsController.getListings);
router.get("/listings/:id", listingsController.getListing);
router.put("/listings/:id", listingsController.putListing);
router.delete("/listings/:id", listingsController.deleteListingById);
router.get("/mylistings", listingsController.getMyListingsHandler);
router.get("/listingimg", listingsController.getListingImg);
router.put("/listingimg", listingsController.uplListingImg);


export default router;

