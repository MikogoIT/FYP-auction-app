# telegram/handlers/withdraw.py

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from api import fetch_user_bids
from utils import require_telegram_link

user_withdraw_context = {}

async def withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    args = context.args
    
    # Check if user is linked
    linked_data = await require_telegram_link(update, context)
    if not linked_data:
        return # Early return if not linked

    user_id = linked_data["user_id"]
    
    if args:
        auction_id = args[0]
        # Directly confirm withdrawal for this auction_id
        await ask_withdraw_confirmation(chat_id, user_id, auction_id, update)
        
    else:
        # No auction_id provided - fetch user's active bids to select from
        bids = await fetch_user_bids(user_id)
        if not bids:
            await update.message.reply_text("You have no bids to withdraw.")
            return
        
        # Build inline keyboard with auctions
        keyboard = []
        for bid in bids:
            # Show title and auction_id on button, callback_data includes auction_id
            keyboard.append([
                InlineKeyboardButton(
                    f"{bid['listing_title']} (Auction #{bid['auction_id']})",
                    callback_data=f"withdraw_select_{bid['auction_id']}"
                )
            ])
            
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Select the auction for which you want to withdraw your bid:",
            reply_markup=reply_markup
        )
            
async def ask_withdraw_confirmation(chat_id, user_id, auction_id, update_or_callback):
    # Store context for confirmation
    user_withdraw_context[chat_id] = {
        "user_id": user_id,
        "auction_id": auction_id
    }
    
    keyboard = [
        [
            InlineKeyboardButton("✅ Confirm Withdrawal", callback_data="withdraw_confirm_yes"),
            InlineKeyboardButton("❌ Cancel", callback_data="withdraw_confirm_no"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message_text = (
        f"⚠️ You are about to permanently withdraw your bid on auction #{auction_id}.\n"
        f"A 5% fee will be incurred!\n\n"
        "Do you want to proceed?"
    )
    
    if hasattr(update_or_callback, "message"): # It's a command Update
        await update_or_callback.message.reply_text(message_text, reply_markup=reply_markup)
    else: # It's a CallbackQuery
        await update_or_callback.edit_message_text(message_text, reply_markup=reply_markup)