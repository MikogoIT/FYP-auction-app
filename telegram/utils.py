# telegram/utils.py

from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from api import is_telegram_user_linked
from config import BACKEND_API_URL
import pytz

SG_TZ = pytz.timezone("Asia/Singapore")

# Generic check for linked Telegram account
async def require_telegram_link(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    linked_data = await is_telegram_user_linked(telegram_id)
    
    if not linked_data or not linked_data.get("linked"):
        await update.message.reply_text(
            f"⚠️ You need to link your Telegram account before you can use this feature.\n\n"
            f"👉 Link here: {BACKEND_API_URL}"
        )
        return None
    
    return linked_data

def format_date(date_str: str) -> str:
    try:
        dt = datetime.fromisoformat(date_str)
        # Convert to Singapore time if not native
        if dt.tzinfo:
            dt = dt.astimezone(SG_TZ)
        else:
            dt = SG_TZ.localize(dt)
        
        # Example format: Mon 7th July, 2025 @ 04:35 PM
        day = dt.day
        
        # Choose day suffix
        suffix = "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
        formatted = dt.strftime(f"%a {day}{suffix} %B, %Y @ %I:%M %p")
        return formatted
    except Exception:
        return "Unknown"

def format_seller_listings(listings):
    if not listings:
        return "You have no active listings at the moment."
    
    lines = ["<b>Your Active Listings:</b>\n"]
    for listing in listings:
        title = listing.get("title", "Untitled")
        auction_id = listing.get("id", "N/A")
        end_date = format_date(listing.get("end_date", ""))
        min_bid = float(listing.get("min_bid", 0))
        highest_bid = float(listing.get("highest_bid", 0))
        is_active = listing.get("is_active", False)
        status = "🟢 Active" if is_active else "🔴 Closed"
        auction_type = listing.get("auction_type", "ascending").capitalize()
        
        highest_bid_display = "No bids yet" if highest_bid == 0 else f"${highest_bid:.2f}"
        
        lines.append(
            f"📦 <b>Item:</b> {title}\n"
            f"🆔 <b>Listing ID:</b> #{auction_id}\n"
            f"📈 <b>Auction Type:</b> {auction_type}\n"
            f"✅ <b>Status:</b> {status}\n"
            f"⏰ <b>Ends On:</b> {end_date}\n"
            f"💰 <b>Min Bid:</b> ${min_bid:.2f}\n"
            f"💵 <b>Highest Bid:</b> ${highest_bid_display}\n"
            "━━━━━━━━━━━━━━━━━━━━━━━"
        )
        
    return "\n".join(lines)

# Takes a list of bid dicts and returns a nicely formatted string for Telegram
def format_bid_list(bids):
    if not bids:
        return "You have no bids yet."
    
    lines = ["<b>Your bids:</b>\n"]
    for bid in bids:
        amount = float(bid["bid_amount"])
        listing = bid.get("listing_title", "Unknown Item")
        status = bid.get("status", "pending")
        created = format_date(bid["created_at"])
        updated = format_date(bid["updated_at"]) if bid.get("updated_at") else "N/A"
        
        bid_text = (
            f"📦 <b>Item:</b> {listing}\n"
            f"💰 <b>Amount:</b> ${amount:.2f}\n"
            f"🕒 <b>Bidded on:</b> {created}\n"
            f"♻️ <b>Last Updated:</b> {updated}\n"
            f"✅ <b>Status:</b> {status.capitalize()}\n"
            "━━━━━━━━━━━━━━━━━━━━━━━"
        )
        lines.append(bid_text)
        
    return "\n".join(lines)
    

# Format a list of watchlist items into a readable string message
def format_watchlist_message(watchlist_items):
    if not watchlist_items:
        return "💖 Your watchlist is empty."
    
    lines = ["💖 Your Watchlist:"]
    for item in watchlist_items:
        lines.append(f"- #{item['auction_id']} {item['title']} (Ends: {format_date(item['end_date'])})")
    return "\n".join(lines)

def format_recommendations_message(listings):
    if not listings:
        return "🤖 No recommendations available at the moment."

    lines = ["🤖 <b>Recommended Listings:</b>\n"]
    for item in listings:
        title = item.get("title", "Untitled")
        auction_id = item.get("id", "N/A")
        end_date = format_date(item.get("end_date", ""))
        lines.append(f"🛍️ <b>#{auction_id}</b> {title}\n⏰ Ends on: {end_date}\n")

    return "\n".join(lines)

def format_ai_search_results(listings):
    if not listings:
        return "No matching listings found."
    
    lines = []
    search_category = ""
    channel_username = ""
    
    for item in listings:
        title = item.get("title", "Untitled")
        auction_id = item.get("id", "N/A")
        end_date = format_date(item.get("end_date", ""))
        category = item.get("category_name", "Unknown")
        message_id = item.get("message_id")
        category_slug = category.lower().replace(" ", "_")
        
        if message_id:
            view_link = f"https://t.me/{channel_username}/{message_id}"
            view_text = f'<a href="{view_link}">[View in Channel]</a>'
        else:
            view_text = "[Not posted]"
            
        lines.append(
            f"🛍️ <b>#{auction_id}</b> {title}\n"
            f"⏰ Ends on: {end_date}\n"
            f"{view_text}\n"
        )
        search_category = category
        channel_username = f"{category_slug}_fypauction"
    
    header = f"<b>Auctioneer {search_category} Channel (@{channel_username}):</b>\n\n" 
    return header + "\n".join(lines)
    
        
def format_listing_message(listing):
    title = listing.get("title", "No title")
    description = listing.get("description", "No description provided.")
    category = listing.get("category_name", "Unknown")
    min_bid = float(listing.get("min_bid", 0))
    highest_bid = float(listing.get("highest_bid", 0))
    photo_url = listing.get("image_url", "")
    listing_id = listing.get("id", "0")
    tags_raw = listing.get("tags", "") # e.g., "tag1, tag2"
    
    auction_type = listing.get("auction_type", "ascending").lower()
    if auction_type == "ascending":
        auction_type_display = "Ascending ⬆️"
    elif auction_type == "descending":
        auction_type_display = "Descending ⬇️"
    else:
        auction_type_display = auction_type.capitalize()  # fallback display
    
    highest_bid_display = "No bids yet" if highest_bid == 0 else f"${highest_bid:.2f}"
    end_date = format_date(listing.get("end_date", ""))
    
    # Format tags as hashtags if any
    tags_line = ""
    if tags_raw.strip():
        # Split by comma, strip whitespace, prepend # and join back
        tags_list = [f"#{tag.strip()}" for tag in tags_raw.split(",")]
        tags_line = "🏷️ <b>Tags:</b> " + ", ".join(tags_list) + "\n\n"
    
    caption = (
        "🛎️ <b>NEW Listing on Auctioneer!!</b> 🛎️\n\n"
        f"📦 <b>Item:</b> {title}\n"
        f"🏷️ <b>Category:</b> {category}\n"
        f"📈 <b>Auction Type:</b> {auction_type_display}\n"
        f"💰 <b>Starting Bid:</b> ${min_bid:.2f}\n"
        f"💵 <b>Current Highest Bid:</b> {highest_bid_display}\n"
        f"⏰ <b>Ends On:</b> {end_date}\n\n"
        f"{tags_line}"  # Insert tags here if any
        f"📝 <b>Description:</b>\n{description}\n\n"
        "🚀 <i>Place your bid now by clicking the button below!</i>"
    )

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
                url=f"{BACKEND_API_URL}/listings/{listing_id}"
            )
        ]
    ] 

    reply_markup = InlineKeyboardMarkup(buttons)
    
    return photo_url, caption, reply_markup