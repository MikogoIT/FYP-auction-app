# telegram/api.py

from logger import logger
import aiohttp
from config import BACKEND_API_URL, BOT_SECRET

HEADERS = {"Authorization": f"Bearer {BOT_SECRET}"}
JSON_HEADERS = {
    **HEADERS,
    "Content-Type": "application/json"
}

async def is_telegram_user_linked(telegram_id: int) -> dict | None:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/check-account/{telegram_id}",
                headers=HEADERS
            ) as res:
                if res.status != 200:
                    return None
                
                return await res.json()
            
    except Exception as e:
        logger.error(f"Error checking Telegram link status: {e}")
        return None
    
async def save_telegram_message(auction_id: int, message_id: int, channel_id: int, caption: str):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/listings/save-message",
                headers=JSON_HEADERS,
                json={
                    "auctionId": auction_id,
                    "messageId": message_id,
                    "channelId": channel_id,
                    "caption": caption
                },
            ) as resp:
                if resp.status in (200, 201):
                    return await resp.json()
                else:
                    text = await resp.text()
                    logger.error(f"Failed saving telegram message: Status {resp.status}, Response: {text}")
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            
async def fetch_recommendations(user_id: int, limit: int = 5):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/recommendations/comprehensive/{user_id}?limit={limit}",
                headers=HEADERS
            ) as resp:                
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("recommendations", [])
                else:
                    logger.error(f"Failed to fetch recommendations, status: {resp.status}")
                    return []
            
    except Exception as e:
        logger.error(f"Error fetching recommendations: {e}")
        return []

# Fetch bids for a user     
async def fetch_user_bids(user_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/bids/user/{user_id}",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("bids", [])
                else:
                    logger.warning(f"Failed to fetch bids for user #{user_id}: {resp.status}")
                    return []
                
    except Exception as e:
        logger.warning(f"Error fetching bids for user {user_id}: {e}")
    return []

async def fetch_listing_details(auction_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/listings/{auction_id}",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("listing", {})
                else:
                    logger.warning(f"Failed to fetch listing #{auction_id}: {resp.status}")
                    return {}
    except Exception as e:
        logger.error(f"Error fetching listing details: {e}")
        return {}
    
async def fetch_auction_bid_details(auction_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/auctions/{auction_id}/bid-details",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.warning(f"Failed to fetch bid-details for auction #{auction_id}: {resp.status}")
                    return {}
    except Exception as e:
        logger.error(f"Error fetching auction min bid: {e}")
        return {}

async def fetch_user_listings(user_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/listings/user/{user_id}",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("listings", [])
                else:
                    logger.warning(f"Failed to fetch listings for user {user_id}: {resp.status}")
                    return []
                
    except Exception as e:
        logger.warning(f"Error fetching listings for user {user_id}: {e}")
    return []

async def fetch_listings_with_messages():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/listings/with-messages",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.warning(f"Failed to fetch listings with messages: {resp.status}")
                    return []
                
    except Exception as e:
        logger.error(f"Error fetching listings with messages: {e}")
        return []
    
async def fetch_full_listing_with_message(listing_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/listings/full/{listing_id}",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.warning(f"Failed to fetch full listings with messages by id: {resp.status}")
                    return []
    except Exception as e:
        logger.error(f"Error fetching full listing with messages by id: {e}")
        return []

# Add a listing to the user's watchlist
async def add_to_watchlist(user_id: int, listing_id: int) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/watchlist/add",
                headers=JSON_HEADERS,
                json={"user_id": user_id, "auction_id": listing_id}
            ) as resp:
                if resp.status in (200, 201):
                    return {"success": True}
                elif resp.status == 409:
                    return {"success": False, "error": "exists"}
                else:
                    error = await resp.json()
                    return {"success": False, "error": error.get("message", "Unknown error")}
                
    except Exception as e:
        logger.error(f"Error adding to watchlist: {e}")
        return {"success": False, "error": str(e)}
    
# Fetch the watchlist items belonging to the user
async def fetch_user_watchlist(user_id: int) -> list:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/watchlist/user/{user_id}",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("listings", [])
                else:
                    logger.warning(f"Failed to fetch watchlist for user #{user_id}: {resp.status}")
                    return []
    except Exception as e:
        logger.error(f"Error fetching watchlist: {e}")
        return []
    
async def remove_from_watchlist(user_id: int, listing_id: int) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/watchlist/remove",
                headers=JSON_HEADERS,
                json={"user_id": user_id, "auction_id": listing_id}
            ) as resp:
                if resp.status == 200:
                    return {"success": True}
                elif resp.status == 404:
                    return {"success": False, "error": "not_found"}
                else:
                    error = await resp.json()
                    return {"success": False, "error": error.get("message", "Unknown error")}
    except Exception as e:
        logger.error(f"Error removing from watchlist: {e}")
        return {"success": False, "error": str(e)}
    
# Withdraw a bid of the user
async def withdraw_bid(user_id: int, auction_id: int) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/bid/withdraw",
                headers=JSON_HEADERS,
                json={"user_id": user_id, "auction_id": auction_id}
            ) as resp:
                if resp.status == 200:
                    return {"success": True, "message": f"Your bid on auction #{auction_id} has been withdrawn successfully."}
                else:
                    error = await resp.json()
                    return {"success": False, "message": error.get("message", "Unknown error")}
    except Exception as e:
        logger.error(f"Error withdrawing bid: {e}")
        return {"success": False, "message": "An error occurred while withdrawing your bid."}
    
# Place a bid on a listing
async def place_bid(user_id: int, auction_id: int, amount: float) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/bid",
                headers=JSON_HEADERS,
                json={
                    "user_id": user_id,
                    "auction_id": auction_id,
                    "bid_amount": amount
                }
            ) as resp:
                if resp.status == 201:
                    data = await resp.json()
                    auction_type = data.get("auction_type")
                    bid_amount = float(amount)
                    
                    if auction_type == "descending":
                        message = (
                            f"Your bid of ${bid_amount:.2f} has been placed on item #{auction_id} successfully!\n"
                            f"📉 You may now be the lowest bidder."
                        )
                    else: # ascending or fallback
                        updated_price = data.get("updated_price", bid_amount)
                        message = (
                            f"Your bid of ${bid_amount:.2f} has been placed on item #{auction_id} successfully!\n"
                            f"💵 The current highest bid is now ${updated_price:.2f}."
                        )
                    return {"success": True, "message": message}
                else:
                    error = await resp.json()
                    return {"success": False, "message": error.get("message", "Unknown error")}
                
    except Exception as e:
        logger.error(f"Error placing bid: {e}")
        return {"success": False, "message": "An error occurred while placing your bid."}
    
async def search_listings(category=None, max_price=None, keywords=None):
    try:
        params = {
            "category": category,
            "max_price": max_price,
            "keywords": ",".join(keywords) if keywords else None
        }
        params = {k: v for k, v in params.items() if v is not None}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/listings/search",
                params=params,
                headers=HEADERS
            ) as res:
                if res.status == 200:
                    return await res.json()
                else:
                    logger.warning(f"Search API failed with status {res.status}")
    except Exception as e:
        logger.error(f"Failed to search listings: {e}")
    return {"listings": []}

# Get unsent notifications
async def fetch_unsent_notifications():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/notifications/unsent",
                headers=HEADERS
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                logger.warning(f"Failed to fetch notifications: {resp.status}")
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {e}")
    return []

# Mark notifications as sent
async def mark_notification_sent(notif_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/notifications/mark-sent",
                headers=JSON_HEADERS,
                json={"id": notif_id}
            ) as resp:
                return resp.status == 200
    except Exception as e:
        logger.error(f"Failed to mark notifications as sent: {e}")
    return False

# Get unposted listings
async def fetch_unposted_listings():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_API_URL}/api/telegram/listings/unposted",
                headers=HEADERS
            ) as res:
                if res.status == 200:
                    return await res.json()
                logger.warning(f"Failed to fetch unposted listings: {res.status}")
    except Exception as e:
        logger.error(f"Failed to fetch unposted listings: {e}")
    return []

# Mark listings as posted
async def mark_listing_posted(listing_id: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_API_URL}/api/telegram/mark-posted/{listing_id}",
                headers=HEADERS
            ) as res:
                return res.status == 200
    except Exception as e:
        logger.error(f"Failed to mark listing as posted: {e}")
    return False