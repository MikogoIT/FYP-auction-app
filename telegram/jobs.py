# telegram/jobs.py

from telegram.ext import ContextTypes
from logger import logger
from config import BACKEND_API_URL
from utils import format_listing_message
from html import escape
from api import save_telegram_message, fetch_unsent_notifications, mark_notification_sent, fetch_unposted_listings, mark_listing_posted

async def poll_notifications(context: ContextTypes.DEFAULT_TYPE) -> None:
    bot = context.bot # get bot instance from context
    try:
        notifications = await fetch_unsent_notifications()
                
        for notif in notifications:
            telegram_id = notif["telegram_id"]
            content = notif["content"]
            notif_id = notif["id"]
            
            try:
                await bot.send_message(
                    chat_id=telegram_id,
                    text=f"<b>Notification:</b> {escape(content)}",
                    parse_mode="HTML"
                )
                
                # Mark as sent
                await mark_notification_sent(notif_id)
                logger.info(f"Sent notification {notif_id} to {telegram_id}")
                
            except Exception as e:
                logger.error(f"Error sending notification {notif_id}: {e}")
                
    except Exception as e:
        logger.error(f"Polling error: {e}")

async def poll_and_post_listings(bot) -> None:
    try:
        listings = await fetch_unposted_listings()
    except Exception as e:
        logger.error(f"Failed to fetch unposted listings: {e}")
        return

    for listing in listings:
        category = listing.get("category_name", "").lower()
        channel_username = f"@{category}_fypauction"

        if not listing.get("image_url"):
            logger.warning(f"Listing {listing['id']} has no image. Skipping.")
            continue

        try:
            photo_url, caption, reply_markup = format_listing_message(listing)

            # Send to category channel
            message = await bot.send_photo(
                chat_id=channel_username,
                photo=photo_url,
                caption=caption,
                parse_mode="HTML",
                reply_markup=reply_markup,
            )
            
            # Save the message info to backend
            await save_telegram_message(listing["id"], message.message_id, message.chat.id, caption)
            
            # Notify seller directly through private chat
            seller_telegram_id = listing.get("seller_telegram_id")
            if seller_telegram_id:
                min_bid = float(listing.get('min_bid', 0))
                listing_url = f"{BACKEND_API_URL}/bid/{listing['id']}"
                
                notification_msg = (
                    f"📢 Your listing '{listing.get('title')}' is now live on Auctioneer!\n"
                    f"Category: {listing.get('category_name')}\n"
                    f"Minimum Bid: ${min_bid:.2f}\n"
                    f"View it here: {listing_url}"
                )
                
                await bot.send_message(chat_id=seller_telegram_id, text=notification_msg)

            # Mark listing as posted (and notified)
            await mark_listing_posted(listing["id"])
            logger.info(f"Posted listing {listing['id']} to {channel_username} and notified seller")

        except Exception as err:
            if "chat not found" in str(err).lower():
                logger.warning(f"Channel not found for {channel_username}, skipping.")
            else:
                logger.error(f"Error posting listing {listing['id']}: {err}")