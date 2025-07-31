# File: main.py

from logger import logger
from config import TELEGRAM_BOT_TOKEN, WEBHOOK_URL, PORT, BOT_SECRET
from telegram import BotCommand
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
from handlers import (
    start, help_command, bid, mybids, bid_increment_fixed, withdraw, mylistings, mywatchlist,
    removewatchlist, handle_free_search, confirm_bid_callback, withdraw_callback_handler, 
    watchlist_callback_handler, myrecommendations
)
from jobs import poll_and_post_listings, poll_notifications
import asyncio
import requests

def set_telegram_webhook():
    if not TELEGRAM_BOT_TOKEN or not WEBHOOK_URL:
        raise RuntimeError("TELEGRAM_BOT_TOKEN or WEBHOOK_URL not set")
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    data = {
        "url": WEBHOOK_URL,
        "secret_token": BOT_SECRET,
    }
    
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        logger.info("Telegram webhook set: %s", response.json())
    else:
        logger.error("Failed to set Telegram webhook: %s", response.text)

async def set_commands(application):
    commands = [
        BotCommand("start", "Start or resume"),
        BotCommand("help", "Show help"),
    ]
    
    await application.bot.set_my_commands(commands)

async def start_bot():
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
    await set_commands(application)

    try:
        logger.info("Bot initializing webhook...")

        # # Schedule listing poster every 5 minutes (300 seconds)
        # application.job_queue.run_repeating(poll_and_post_listings, interval=300, first=10)
        
        # # Schedule notification poster every 1min (60 seconds)
        # application.job_queue.run_repeating(poll_notifications, interval=60, first=5)

        # logger.info("Bot started with polling listing poster and notifications job.")
        # application.run_polling()
        
        # Initialize first
        await application.initialize()
        
        # Start the bot and webhook manually
        await application.start()
        
        logger.info(f"Telegram bot webhook URL: {WEBHOOK_URL}")
        
        # Set Telegram webhook once per deploy/startup
        # logger.info("Setting Telegram webhook...")
        # set_telegram_webhook()
        
        # Start webhook listener
        await application.updater.start_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path="/webhook",
            webhook_url=WEBHOOK_URL,
            secret_token=BOT_SECRET,
        )
    except Exception as e:
        logger.error("Bot crashed with error: %s", e)
    finally:
        logger.info("Shutting down bot gracefully...")
        await application.updater.stop()
        await application.stop()
        await application.shutdown()
    
if __name__ == "__main__":
    asyncio.run(start_bot())