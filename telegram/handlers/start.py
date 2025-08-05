# telegram/handlers/start.py

from telegram import Update
from telegram.ext import ContextTypes
from api import is_telegram_user_linked, fetch_user_bids, fetch_user_listings, fetch_user_watchlist
from config import BACKEND_API_URL

# Telegram Bot Handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_id = update.effective_user.id # Telegram user's numeric ID
    chat_id = update.effective_chat.id
    args = context.args
    
    linked_data = await is_telegram_user_linked(telegram_id)
    
    if not linked_data or not linked_data.get("linked"):
        await update.message.reply_text(
            "👋 Welcome to Auctioneer!\n\n"
            "To use this bot, please link your Telegram account from your website profile settings.\n\n"
            f"🔗 Link here: {BACKEND_API_URL}"
        )
        return

    # If /start bid_<id>, trigger bid flow
    if args and args[0].startswith("bid_"):
        from handlers.bid import start_bid_flow
        auction_id = args[0].split("_")[1]
        await start_bid_flow(chat_id, auction_id, linked_data, update)
        
    # If /start watch_<id>, trigger watchlist flow
    if args and args[0].startswith("watch_"):
        from handlers.watchlist import start_watchlist_flow
        listing_id = args[0].split("_")[1]
        await start_watchlist_flow(listing_id, linked_data, update)
    
    # If plain /start, show a summary of their roles
    user_id = linked_data.get("user_id")
    
    bids = await fetch_user_bids(user_id)
    listings = await fetch_user_listings(user_id)
    watchlist = await fetch_user_watchlist(user_id)
            
    summary = (
        "👋 Welcome to Auctioneer!\n\n"
        f"✅ Your account is linked.\n\n"
        f"📈 You have <b>{len(bids)}</b> bid(s).\n"
        f"📦 You have <b>{len(listings)}</b> active listing(s).\n"
        f"👁️ You are watching <b>{len(watchlist)}</b> item(s).\n\n"
        "Use /help to see what you can do!"
    )

    await update.message.reply_text(summary, parse_mode="HTML")