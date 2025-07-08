import { sql } from "../utils/db.js";
import { insertNotification, hasRecentNotification } from "../models/notificationModel.js";

async function notifyEndingAuctions() {
  const nowUTC = new Date();
  const tenMinLaterUTC = new Date(nowUTC.getTime() + 10 * 60 * 1000);

  try {
    const results = await sql`
      SELECT DISTINCT user_id, listing_id, title, end_date FROM (
        SELECT b.buyer_id AS user_id, l.id AS listing_id, l.title, l.end_date
        FROM auction_listings l
        JOIN bids b ON l.id = b.auction_id
        WHERE (l.end_date - interval '8 hours') BETWEEN ${nowUTC.toISOString()} AND ${tenMinLaterUTC.toISOString()}
          AND l.is_active = true

        UNION

        SELECT w.buyer_id AS user_id, l.id AS listing_id, l.title, l.end_date
        FROM auction_listings l
        JOIN watchlist w ON l.id = w.auction_id
        WHERE (l.end_date - interval '8 hours') BETWEEN ${nowUTC.toISOString()} AND ${tenMinLaterUTC.toISOString()}
          AND l.is_active = true
      ) AS combined
    `;

    console.log('nowUTC:', nowUTC, 'tenMinLaterUTC:', tenMinLaterUTC);
    console.log('SQL results:', results);

    for (const { user_id, listing_id, title, end_date } of results) {
      const alreadySent = await hasRecentNotification(user_id, listing_id);
      if (alreadySent) continue;

      const endDateSG = new Date(end_date);
      const formattedTime = endDateSG.toLocaleString("en-SG");

<<<<<<< Updated upstream
      const content = `⏰ Auction "${title}" is ending at ${formattedTime}`;
=======
      const content = '⏰ Auction "${title}" is ending at ${formattedTime}';
>>>>>>> Stashed changes
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