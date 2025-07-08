import cron from "node-cron";
import { sql } from "../utils/db.js";
import { insertNotification, hasRecentNotification } from "../models/notificationModel.js";

// each mins
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const tenMinLater = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    const results = await sql`
      SELECT DISTINCT b.user_id, l.id AS listing_id, l.title, l.end_date
      FROM auction_listings l
      JOIN bids b ON l.id = b.auction_id
      WHERE l.end_date BETWEEN ${now} AND ${tenMinLater}
        AND l.is_active = true
    `;

    for (const { user_id, listing_id, title, end_date } of results) {
      const alreadySent = await hasRecentNotification(user_id, listing_id);
      if (alreadySent) continue;

      const formattedTime = new Date(end_date).toLocaleString("en-SG");
      const content = `⏰ Auction "${title}" is ending at ${formattedTime}`;
      await insertNotification(user_id, listing_id, content);
    }

    if (results.length > 0) {
      console.log(`[notifyEndingAuctions] ✅ Notified ${results.length} users`);
    }
  } catch (err) {
    console.error("[notifyEndingAuctions] ❌ Error:", err);
  }
});
