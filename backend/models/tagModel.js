// models/tagModel.js
import { sql } from "../utils/db.js";

export async function insertTagsToAuction(auctionId, tags) {
  for (const tagName of tags) {
    // 1. Add tag to tags table (ignore if exists)
    await sql`
      INSERT INTO tags (name) VALUES (${tagName})
      ON CONFLICT (name) DO NOTHING;
    `;

    // 2. Get the tag ID
    const result = await sql`
      SELECT id FROM tags WHERE name = ${tagName};
    `;
    if (!result.length) {
      throw new Error(`Tag ${tagName} could not be found or inserted`);
    }
    const tagId = result[0].id;

    // 3. Link auction_id <-> tag_id
    await sql`
      INSERT INTO auction_listing_tags (auction_id, tag_id)
      VALUES (${auctionId}, ${tagId})
      ON CONFLICT DO NOTHING;
    `;
  }
}
