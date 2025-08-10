# telegram/handlers/listing.py

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, InputMediaPhoto
from telegram.ext import ContextTypes
from telegram.error import TelegramError
from api import (
    is_telegram_user_linked, save_telegram_message, fetch_user_listings, 
    fetch_listings_with_messages, fetch_full_listing_with_message, delete_telegram_message,
    fetch_listing_message_info
)
from logger import logger
from utils import format_seller_listings, format_listing_message
import re

async def mylistings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_id = update.effective_user.id
    linked_data = await is_telegram_user_linked(telegram_id)
    if not linked_data or not linked_data.get("linked"):
        await update.message.reply_text("You must link your Telegram account to manage your listings.")
        return
    
    user_id = linked_data.get("user_id")
    if not user_id:
        await update.message.reply_text("Could not retrieve your user ID. Please try again later.")
        return
    
    # Fetch user's listings from backend
    listings = await fetch_user_listings(user_id)
    
    if not listings:
        await update.message.reply_text("You have no active listings at the moment.")
        return
    
    # Format listings for Telegram message
    message_text = format_seller_listings(listings)
    await update.message.reply_text(message_text, parse_mode="HTML")

async def update_listing_message(auction_id: int, new_amount: float, context: ContextTypes.DEFAULT_TYPE) -> None:
    listings = await fetch_listings_with_messages()
    telegram_entry = next((item for item in listings if item["id"] == auction_id), None)
    
    if not telegram_entry:
        logger.warning(f"No telegram message found for auction #{auction_id}")
        return
    
    # Get the original message
    original_text = telegram_entry.get("caption", "")
    
    if not original_text:
        logger.warning(f"No caption stored for auction #{auction_id}")
        return
    
    # Replace only the current highest bid line
    updated_text = re.sub(
        r"(💵 <b>Current Highest Bid:</b> )\$[0-9,.]+",
        rf"\1${new_amount:.2f}",
        original_text,
    )
    
    print(updated_text)
    
    listing_id = telegram_entry["id"]
    
    # Native Telegram keyboard
    buttons = [
        [
            InlineKeyboardButton(
                text="💸 Bid Now",
                url=f"https://t.me/AuctioneerFYPBot?start=bid_{listing_id}"
            ),
            InlineKeyboardButton(
                text="💖 Watchlist",
                url=f"https://t.me/AuctioneerFYPBot?start=watch_{listing_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="🌐 View on Web",
                url=f"https://auctioneer.timothy-mah.com/bid/{listing_id}"
            )
        ]
    ] 

    reply_markup = InlineKeyboardMarkup(buttons)
    
    try:
        await context.bot.edit_message_caption(
            chat_id=telegram_entry["channel_id"],
            message_id=telegram_entry["message_id"],
            caption=updated_text,
            reply_markup=reply_markup,
            parse_mode="HTML"
        )
        
        # Save Telegram Message to Backend
        await save_telegram_message(auction_id, telegram_entry["message_id"], telegram_entry["channel_id"], updated_text)
    except Exception as e:
        logger.error(f"Error in update_listing_message(): {e}")
        
async def update_message_by_listing_id(listing_id: int, bot) -> None:
    listing = await fetch_full_listing_with_message(listing_id)
    if not listing:
        logger.warning(f"No listing data returned for ID #{listing_id}")
        return
    
    if not listing.get("image_url"):
        logger.warning(f"Listing {listing_id} has no image. Skipping update.")
        return
    
    try:
        photo_url, caption, reply_markup = format_listing_message(listing)
        
        # Attempt to update the photo & caption together
        try:
            await bot.edit_message_media(
                chat_id=listing["channel_id"],
                message_id=listing["message_id"],
                media=InputMediaPhoto(
                    media=photo_url,
                    caption=caption,
                    parse_mode="HTML"
                ),
                reply_markup=reply_markup
            )
            logger.info(f"Succesfully updated image and caption for listing #{listing_id}")
        except Exception as media_err:
            # If media update fails (e.g., Telegram bug), fallback to just updating the caption
            logger.warning(f"Failed to edit media for listing #{listing_id}, falling back to caption update only: {media_err}")
            await bot.edit_message_caption(
                chat_id=listing["channel_id"],
                message_id=listing["message_id"],
                caption=caption,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )
            logger.info(f"Updated caption only for listing #{listing_id}")
            
        # Save updated message in database
        await save_telegram_message(
            listing_id,
            listing["message_id"],
            listing["channel_id"],
            caption
        )
        
    except Exception as e:
        logger.error(f"Failed to update listing #{listing_id}: {e}")
        
async def delete_message_by_listing_id(listing_id: int, bot) -> None:
    listing = await fetch_listing_message_info(listing_id)
    if not listing:
        logger.warning(f"No listing data returned for ID #{listing_id}")
        return
    
    if not listing.get("channel_id") or not listing.get("message_id"):
        logger.warning(f"Listing {listing_id} missing channel_id or message_id. Cannot delete message.")
        return
    
    try:
        await bot.delete_message(
            chat_id=listing["channel_id"],
            message_id=listing["message_id"]
        )
        logger.info(f"Successfully deleted Telegram message for listing #{listing_id}")
        
        #clear stored message_id and channel_id in DB, or mark as deleted
        await delete_telegram_message(listing_id)
        
    except TelegramError as te:
        logger.error(f"Telegram API error deleting message for listing #{listing_id}: {te}")
    except Exception as e:
        logger.error(f"Failed to delete Telegram message for listing #{listing_id}: {e}")
    