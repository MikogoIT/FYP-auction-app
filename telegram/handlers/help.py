# telegram/handlers/help.py

from telegram import Update
from telegram.ext import ContextTypes

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_help(update)

async def send_help(update: Update) -> None:
    help_text = (
        "🛠️ *Available commands:*\n\n"
        "🟢 *Buyer Commands*\n"
        "/bid `<amount>` - Place a bid\n"
        "/bidinc - Quick bid +$10\n"
        "/mybids - View your bids\n"
        "/withdraw - Withdraw your bids\n"
        "/mywatchlist - View your watchlist\n"
        "/removewatchlist - Removes your most recent watchlisted listing\n"
        "/myrecommendations - View recommended listings\n\n"
        "🟣 *Seller Commands*\n"
        "/mylistings - View your listings\n\n"
        "🔎 *Search Commands*\n"
        "You can also search listings by typing natural language queries, for example:\n"
        "_\"shoes under 100\"\n"
        "\"red bags max price 50\"\n"
        "\"vintage watches\"_\n\n"
        "Just send your query as a message, and I'll try to find matching auctions for you!\n\n"
        "⚙️ *General*\n"
        "/help - Show this help\n"
        "/start - Start or resume\n\n"
        "✨ You can be both a buyer and seller!"
    )
    
    await update.message.reply_text(help_text, parse_mode="Markdown")