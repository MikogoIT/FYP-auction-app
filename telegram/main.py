# File: main.py

import functions_framework
from logger import logger
from config import TELEGRAM_BOT_TOKEN, WEBHOOK_URL, PORT
from telegram import BotCommand
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
from handlers import (
    start, help_command, bid, mybids, bid_increment_fixed, withdraw, mylistings, mywatchlist,
    removewatchlist, handle_free_search, confirm_bid_callback, withdraw_callback_handler, 
    watchlist_callback_handler, myrecommendations
)
from jobs import poll_and_post_listings, poll_notifications

async def set_commands(application):
    commands = [
        BotCommand("start", "Start or resume"),
        BotCommand("help", "Show help"),
    ]
    
    await application.bot.set_my_commands(commands)

@functions_framework.http
def main(request):
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN env variable not set")

    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()  

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("bid", bid))
    application.add_handler(CommandHandler("mybids", mybids))
    application.add_handler(CommandHandler("bidinc", bid_increment_fixed))
    application.add_handler(CallbackQueryHandler(confirm_bid_callback, pattern=r"^confirm_bid_"))
    application.add_handler(CommandHandler("withdraw", withdraw))
    application.add_handler(CallbackQueryHandler(withdraw_callback_handler, pattern=r"^withdraw_"))
    application.add_handler(CommandHandler("mylistings", mylistings))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_free_search))
    application.add_handler(CommandHandler("mywatchlist", mywatchlist))
    application.add_handler(CommandHandler("myrecommendations", myrecommendations))
    application.add_handler(CommandHandler("removewatchlist", removewatchlist))
    application.add_handler(CallbackQueryHandler(watchlist_callback_handler, pattern="^watchlist_"))

    # Set auto-complete commands after bot initializes
    application.post_init = set_commands

    # Schedule listing poster every 5 minutes (300 seconds)
    application.job_queue.run_repeating(poll_and_post_listings, interval=300, first=10)
    
    # Schedule notification poster every 1min (60 seconds)
    application.job_queue.run_repeating(poll_notifications, interval=60, first=5)

    # logger.info("Bot started with polling listing poster and notifications job.")
    # application.run_polling()
    logger.info("Bot started with polling listing poster and notifications job.")
    application.run_webhook(
        listen="0.0.0.0",
        port=PORT,
        webhook_url=WEBHOOK_URL,
    )