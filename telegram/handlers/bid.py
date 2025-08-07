# telegram/handlers/bid.py

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from api import fetch_user_bids, fetch_listing_details, fetch_auction_bid_details
from utils import format_bid_list, require_telegram_link, is_listing_expired

user_bid_context = {}
pending_bids = {}

async def start_bid_flow(chat_id, auction_id, linked_data, update):
    # Fetch listing title from backend
    user_id = linked_data.get("user_id")
    
    listing = await fetch_listing_details(auction_id)
    
    if is_listing_expired(listing.get("end_date", "")):
        await update.message.reply_text("⚠️ This auction has expired and is no longer accepting bids.")
        return
    
    bid_data = await fetch_auction_bid_details(auction_id)
    
    listing_title = listing.get("title")
    min_bid = listing.get("min_bid")
    seller_id = listing.get("seller_id")
    highest_bid = bid_data.get("highest_bid")
    auction_type = listing.get("auction_type", "ascending")
        
    # Check if user is the seller
    if seller_id == user_id:
        await update.message.reply_text(
            "⚠️ You cannot place a bid on your own listing."
        )
        return
        
    user_bid_context[chat_id] = {
        "auction_id": auction_id,
        "user_id": linked_data.get("user_id"), # from backend response
        "listing_title": listing_title,
        "auction_type": auction_type
    }
        
    # Build message
    message_lines = [f"Welcome! You're viewing item #{auction_id}"]
        
    if listing_title:
        message_lines[0] += f" - {listing_title}."
    
    if auction_type == "ascending":
        if highest_bid and float(highest_bid) > 0:
            # Someone has already bid
            message_lines.append(f"💵 Current highest bid: ${float(highest_bid):.2f}")
            message_lines.append("To place a bid, you must bid higher than the current highest bid.")
        else:
            # No bids yet
            message_lines.append(f"💰 No bids yet. Starting bid: ${float(min_bid):.2f}")
            message_lines.append("Place your first bid to get started!")

        message_lines.append(
            "\nUse /bid <amount> to place your bid.\n"
            "Or use /bidinc to quickly increase your bid by $10."
        )
    
    elif auction_type == "descending":
        # For descending, bids at current_price will win the auction
        current_price = bid_data.get("current_price")
        start_price = bid_data.get("start_price")
        discount_percentage = float(bid_data.get("discount_percentage", 10))
        
        message_lines.append(f"🔻 Descending Auction Details 🔻")
        message_lines.append(f"Start Price: ${float(start_price):.2f}")
        message_lines.append(f"Minimum Price: ${float(min_bid):.2f}")
        if current_price:
            message_lines.append(f"Current Price: ${float(current_price):.2f}")
        if discount_percentage > 0:
            message_lines.append(f"Price drops by {discount_percentage:.2f}% at every interval")
            
        message_lines.append("\nUse /bidinc to claim the item at the current price")
        
    await update.message.reply_text("\n".join(message_lines))
    
async def bid(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    if chat_id not in user_bid_context:
        await update.message.reply_text(
            "Please start bidding by clicking 'Bid Now' on a listing first or use /start bid_<id>"
        )
        return

    if not context.args:
        await update.message.reply_text("Usage: /bid <amount>")
        return

    try:
        amount = float(context.args[0])
    except ValueError:
        await update.message.reply_text("Please enter a valid number.")
        return

    auction_id = user_bid_context[chat_id]["auction_id"]
    user_id = user_bid_context[chat_id]["user_id"]
    auction_type = user_bid_context[chat_id].get("auction_type", "ascending")
    
    await prepare_bid_confirmation(chat_id, user_id, auction_id, amount, auction_type, update)

async def prepare_bid_confirmation(chat_id, user_id, auction_id, amount, auction_type, update):
    pending_bids[chat_id] = {
        "auction_id": auction_id,
        "user_id": user_id,
        "amount": amount
    }
    
    keyboard = [
        [
            InlineKeyboardButton("✅ Confirm", callback_data="confirm_bid_yes"),
            InlineKeyboardButton("❌ Cancel", callback_data="confirm_bid_no"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if auction_type == "descending":
        msg = (
            f"You're about to *claim* item #{auction_id} for ${amount:.2f}.\n"
            "If accepted, the auction will end immediately.\n\n"
            "⚠️ This is a Descending auction. You're agreeing to instantly claim the item at the current price.\n"
            "If another buyer submits first, your bid may fail."
        )        
    else:
        msg = (
            f"You're about to place a bid of ${amount:.2f} on item #{auction_id}.\n"
            "Please confirm to place the bid or cancel it."
        )
    
    await update.message.reply_text(msg, reply_markup=reply_markup)

async def mybids(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    linked_data = await require_telegram_link(update, context)
    if not linked_data:
        return # Early return if not linked
    
    user_id = linked_data["user_id"]
    if not user_id:
        await update.message.reply_text("Could not retrieve your user ID. Please try again later.")
        return
    
    bids = await fetch_user_bids(user_id)
    
    if not bids:
        await update.message.reply_text(
            "You have no bids on any listings yet.\n"
            "To start bidding, click the '💸 Bid Now' button on a listing"
        )
        return
    
    # Formatting for bids
    message = format_bid_list(bids)
    
    await update.message.reply_text(message, parse_mode="HTML")
    
# /bidinc command handler - increment bid by $10
async def bid_increment_fixed(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    if chat_id not in user_bid_context:
        await update.message.reply_text("Start bidding first with /start bid_<id>")
        return
    
    auction_id = user_bid_context[chat_id]["auction_id"]
    user_id = user_bid_context[chat_id]["user_id"]
    auction_type = user_bid_context[chat_id].get("auction_type", "ascending")
    
    # Fetch current highest bid from backend
    bid_data = await fetch_auction_bid_details(auction_id)
    highest_bid = float(bid_data.get("highest_bid", 0))
    min_bid = float(bid_data.get("min_bid", 0))
    
    if auction_type == "ascending":
        # Use highest_bid if > 0 else min_bid
        base_bid = highest_bid if highest_bid and highest_bid > 0 else min_bid                
        increment = 10.0
        new_bid = base_bid + increment
        
    elif auction_type == "descending":
        current_price = float(bid_data.get("current_price", 0))
        
        # For descending, lower the bid by $10 but now below min_bid
        if current_price <= 0:
            await update.message.reply_text("⚠️ Current price is unavailable. Please try again shortly.")
            return

        new_bid = current_price  # Must match exactly — this is the claim
    else:
        await update.message.reply_text("Unsupported auction type for bid increment.")
        return
    
    await prepare_bid_confirmation(chat_id, user_id, auction_id, new_bid, auction_type, update)