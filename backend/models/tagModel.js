// models/tagModel.js
import { sql } from "../utils/db.js";

export async function insertTagsToAuction(auctionId, tags) {
  for (const rawTag of tags) {
    if (typeof rawTag !== "string") continue;

    const tagName = rawTag.trim().toLowerCase();
    if (!tagName) continue;

    // Insert tag or ignore if it exists
    await sql`
      INSERT INTO tags (name) VALUES (${tagName})
      ON CONFLICT (name) DO NOTHING;
    `;

    const tagResult = await sql`
      SELECT id FROM tags WHERE name = ${tagName};
    `;

    if (!tagResult.length) {
      throw new Error(`Tag "${tagName}" could not be found or inserted`);
    }

    const tagId = tagResult[0].id;

    // Link tag to listing
    await sql`
      INSERT INTO auction_listing_tags (auction_id, tag_id)
      VALUES (${auctionId}, ${tagId})
      ON CONFLICT DO NOTHING;
    `;
  }
}
