# File: handlers/callbacks.py

from telegram import Update
from telegram.ext import ContextTypes
from api import place_bid, withdraw_bid, remove_from_watchlist
from utils import require_telegram_link
from handlers.bid import pending_bids
from handlers.withdraw import user_withdraw_context, ask_withdraw_confirmation
from handlers.listings import update_listing_message
from handlers.watchlist import watchlist_removal_context, ask_watchlist_removal_confirmation

async def confirm_bid_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    
    chat_id = query.message.chat.id
    
    if chat_id not in pending_bids:
        await query.edit_message_text("No bid is pending confirmation.")
        return
    
    data = query.data
    if data == "confirm_bid_yes":
        bid_info = pending_bids.pop(chat_id)
        result = await place_bid(bid_info["user_id"], bid_info["auction_id"], bid_info["amount"])
        await query.edit_message_text(result["message"])
        
        if result["success"]:
            # Update public Telegram listing message
            await update_listing_message(int(bid_info["auction_id"]), bid_info["amount"], context)
                
    elif data == "confirm_bid_no":
        pending_bids.pop(chat_id)
        await query.edit_message_text("Bid cancelled.")
        
async def withdraw_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    chat_id = query.message.chat.id
    
    data = query.data
    
    if data.startswith("withdraw_select_"):
        auction_id = data.split("_")[-1]
        linked_data = await require_telegram_link(update, context)
        if not linked_data:
            return # Early return if not linked
        
        user_id = linked_data["user_id"]
        await ask_withdraw_confirmation(chat_id, user_id, auction_id, query)
        
    elif data == "withdraw_confirm_yes":
        if chat_id not in user_withdraw_context:
            await query.edit_message_text("No withdrawal request found.")
            return
        
        info = user_withdraw_context.pop(chat_id)
        user_id = info["user_id"]
        auction_id = info["auction_id"]
        
        result = await withdraw_bid(user_id, auction_id)
        await query.edit_message_text(result["message"])
                
    elif data == "withdraw_confirm_no":
        if chat_id in user_withdraw_context:
            user_withdraw_context.pop(chat_id)
        await query.edit_message_text("Withdrawal cancelled.")
        
async def watchlist_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    chat_id = query.message.chat.id
    data = query.data
    
    if data.startswith("watchlist_select_"):
        listing_id = data.split("_")[-1]
        linked_data = await require_telegram_link(update, context)
        if not linked_data:
            return # Early return if not linked
        
        user_id = linked_data["user_id"]
        await ask_watchlist_removal_confirmation(chat_id, user_id, listing_id, query)
        
    elif data == "watchlist_confirm_yes":
        if chat_id not in watchlist_removal_context:
            await query.edit_message_text("No watchlist removal request found.")
            return
        
        info = watchlist_removal_context.pop(chat_id)
        result = await remove_from_watchlist(info["user_id"], info["listing_id"])
        
        if result.get("success"):
            await query.edit_message_text("✅ Removed from watchlist.")
        else:
            error = result.get("error", "Unknown error")
            if error == "not_found":
                await query.edit_message_text("⚠️ Item not found in your watchlist.")
            else:
                await query.edit_message_text(f"❌ Failed to remove from watchlist: {error}")
        
    elif data == "watchlist_confirm_no":
        if chat_id in watchlist_removal_context:
            watchlist_removal_context.pop(chat_id)
        await query.edit_message_text("Watchlist removal cancelled.")