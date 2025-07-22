// test-tag-recommendations.js
import { 
  getUserInterestedTags, 
  getTagBasedRecommendations,
  getTagsForAuction 
} from "./models/tagModel.js";

async function testTagRecommendations() {
  console.log("=== Testing Tag-based Recommendations ===\n");

  try {
    // Test 1: Get user interested tags
    console.log("Test 1: Get user interested tags");
    const userTags = await getUserInterestedTags(1); // assuming user ID 1 exists
    console.log("User interested tags:", userTags);
    console.log("");

    // Test 2: Get tag-based recommendations
    console.log("Test 2: Get tag-based recommendations");
    const recommendations = await getTagBasedRecommendations(1, 5);
    console.log("Tag-based recommendations:", recommendations);
    console.log("");

    // Test 3: Get tags for a specific auction
    if (recommendations.length > 0) {
      const auctionId = recommendations[0].id;
      console.log(`Test 3: Get tags for auction ${auctionId}`);
      const auctionTags = await getTagsForAuction(auctionId);
      console.log("Auction tags:", auctionTags);
    }

  } catch (error) {
    console.error("Error during testing:", error);
  }
}

testTagRecommendations();
