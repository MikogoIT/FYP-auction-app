# telegram/handlers/listing.py

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from api import is_telegram_user_linked, save_telegram_message, fetch_user_listings, fetch_listings_with_messages
from logger import logger
from utils import format_seller_listings
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
    
    print(original_text)
    print(new_amount)
    
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
                url=f"https://auctioneer.timothy-mah.com/listings/{listing_id}"
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