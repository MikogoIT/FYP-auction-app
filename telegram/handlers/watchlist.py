# File: handlers/watchlist.py

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from api import add_to_watchlist, fetch_user_watchlist, remove_from_watchlist
from utils import require_telegram_link, format_watchlist_message

watchlist_removal_context = {}

async def start_watchlist_flow(listing_id: int, linked_data, update: Update):
    user_id = linked_data.get("user_id")
    
    result = await add_to_watchlist(user_id, listing_id)
    if result["success"]:
        await update.message.reply_text(
            f"💖 Listing #{listing_id} has been added to your watchlist!\n"
            "You will receive updates about this item."                      
        )
    else:
        if result.get("error") == "exists":
            await update.message.reply_text(
                f"⚠️ Listing #{listing_id} is already in your watchlist!"
            )
        else:
            await update.message.reply_text(f"Failed to add to watchlist: {result.get('error')}")
            
async def mywatchlist(update: Update, context: ContextTypes.DEFAULT_TYPE):
    linked_data = await require_telegram_link(update, context)
    if not linked_data:
        return # Early return if not linked
    
    user_id = linked_data["user_id"]
    watchlist_items = await fetch_user_watchlist(user_id)
        
    if not watchlist_items:
        await update.message.reply_text("Your watchlist is empty.")
        return
    
    # Format and display the watchlist
    message = format_watchlist_message(watchlist_items)
    await update.message.reply_text(message)
    
async def removewatchlist(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    args = context.args
    
    linked_data = await require_telegram_link(update, context)
    if not linked_data:
        return # Early return if not linked
    
    user_id = linked_data["user_id"]
    
    if args:
        listing_id = args[0]
        # Directly confirm removal for this listing_id
        await ask_watchlist_removal_confirmation(chat_id, user_id, listing_id, update)
        
    else:
        # No listing_id provided - fetch user's watchlist to select from
        watchlist = await fetch_user_watchlist(user_id)
        if not watchlist:
            await update.message.reply_text("You have no items in your watchlist.")
            return
        
        keyboard = []
        for item in watchlist:
            keyboard.append([
                InlineKeyboardButton(
                    f"{item['title']} (Listing #{item['auction_id']})",
                    callback_data=f"watchlist_select_{item['auction_id']}"
                )
            ])
            
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Select the listing you want to remove from your watchlist:",
            reply_markup=reply_markup
        )
        
async def ask_watchlist_removal_confirmation(chat_id, user_id, listing_id, update_or_callback):
    # Store context for confirmation
    watchlist_removal_context[chat_id] = {
        "user_id": user_id,
        "listing_id": listing_id
    }
    
    keyboard = [
        [
            InlineKeyboardButton("✅ Confirm Removal", callback_data="watchlist_confirm_yes"),
            InlineKeyboardButton("❌ Cancel", callback_data="watchlist_confirm_no"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message_text = (
        f"⚠️ You are about to remove listing #{listing_id} from your watchlist.\n\n"
        "Do you want to proceed?"
    )
    
    if hasattr(update_or_callback, "message"):  # It's a command Update
        await update_or_callback.message.reply_text(message_text, reply_markup=reply_markup)
    else:  # It's a CallbackQuery
        await update_or_callback.edit_message_text(message_text, reply_markup=reply_markup)