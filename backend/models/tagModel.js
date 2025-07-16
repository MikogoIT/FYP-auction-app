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

export async function getAllTags({ excludeCategoryName } = {}) {
  if (excludeCategoryName) {
    const result = await sql`
      SELECT DISTINCT t.name
      FROM tags t
      JOIN auction_listing_tags alt ON t.id = alt.tag_id
      JOIN auction_listings al ON alt.auction_id = al.id
      JOIN listing_categories lc ON al.category_id = lc.id
      WHERE LOWER(lc.name) != ${excludeCategoryName.toLowerCase()}
      ORDER BY t.name ASC;
    `;
    return result.map(row => row.name);
  }

  // Default: all tags
  const result = await sql`SELECT name FROM tags ORDER BY name ASC`;
  return result.map(row => row.name);
}
