import { sql } from "../utils/db.js";
import { insertNotification, hasRecentNotification } from "../models/notificationModel.js";

function getSingaporeTime() {
  const now = new Date();
  return new Date(now.getTime());
}

async function notifyEndingAuctions() {
  const sgNow = getSingaporeTime();
  const tenMinLater = new Date(sgNow.getTime() + 10 * 60 * 1000);

  try {
    const results = await sql`
      SELECT DISTINCT user_id, listing_id, title, end_date FROM (
        SELECT b.buyer_id AS user_id, l.id AS listing_id, l.title, l.end_date
        FROM auction_listings l
        JOIN bids b ON l.id = b.auction_id
        WHERE l.end_date BETWEEN ${sgNow.toISOString()} AND ${tenMinLater.toISOString()}
          AND l.is_active = true

        UNION

        SELECT w.buyer_id AS user_id, l.id AS listing_id, l.title, l.end_date
        FROM auction_listings l
        JOIN watchlist w ON l.id = w.auction_id
        WHERE l.end_date BETWEEN ${sgNow.toISOString()} AND ${tenMinLater.toISOString()}
          AND l.is_active = true
      ) AS combined
    `;

    for (const { user_id, listing_id, title, end_date } of results) {
      const alreadySent = await hasRecentNotification(user_id, listing_id);
      if (alreadySent) continue;

      const endDateSG = new Date(new Date(end_date).getTime() - 8 * 60 * 60 * 1000);
      const formattedTime = endDateSG.toLocaleString("en-SG");

      const content = `⏰ Auction "${title}" is ending at ${formattedTime}`;
      await insertNotification(user_id, listing_id, content);
    }

    if (results.length > 0) {
      console.log(`[notifyEndingAuctions] ✅ Notified ${results.length} users`);
    }
  } catch (err) {
    console.error("[notifyEndingAuctions] ❌ Error:", err);
  }
}

setInterval(() => {
  notifyEndingAuctions();
}, 60 * 1000);

notifyEndingAuctions();

export default notifyEndingAuctions;
