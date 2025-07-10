import { sql } from "../utils/db.js";
import { insertNotification, hasRecentNotification } from "../models/notificationModel.js";
import { getEndedAscendingAuctions, getHighestBidderForAuction } from "../models/auctionModel.js";

async function notifyAuctionWinners() {
  try {
    const auctions = await getEndedAscendingAuctions();


    for (const auction of auctions) {
      const { id: auctionId, title, seller_id } = auction;
      const highestBidder = await getHighestBidderForAuction(auctionId);

      if (highestBidder) {
        // notify winner
        const alreadyNotified = await hasRecentNotification(
          highestBidder.buyer_id,
          auctionId,
          60 * 24 * 7,
          "won the item"
        );
        if (alreadyNotified) continue;

        const content = `🏆 You have won the item "${title}", please pay as soon as possible.`;
        await insertNotification(highestBidder.buyer_id, auctionId, content);

        console.log(`[notifyAuctionWinners] ✅ Notified winner ${highestBidder.buyer_id} for listing ${auctionId}`);
      } else {
        console.log("No highest bidder, checking seller notification...");
        const alreadyNotified = await hasRecentNotification(seller_id, auctionId, 60 * 24 * 7);
        console.log("alreadyNotified for seller:", alreadyNotified);
        if (!alreadyNotified) {
          const content = `No one bid on your item "${title}". Please consider relisting it.`;
          await insertNotification(seller_id, auctionId, content);
        }

        await sql`
          UPDATE auction_listings SET is_active = false WHERE id = ${auctionId}
        `;

        console.log(`[notifyAuctionWinners] ❌ No bidders for listing ${auctionId}. Seller notified and marked inactive.`);
      }
    }

    if (auctions.length === 0) {
      console.log("[notifyAuctionWinners] No ended ascending auctions found.");
    }
  } catch (err) {
    console.error("[notifyAuctionWinners] ❌ Error:", err);
  }
}


setInterval(() => {
  notifyAuctionWinners();
}, 60 * 1000);

notifyAuctionWinners();

export default notifyAuctionWinners;
