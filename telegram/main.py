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
import time

def set_telegram_webhook():
    if not TELEGRAM_BOT_TOKEN or not WEBHOOK_URL:
        raise RuntimeError("TELEGRAM_BOT_TOKEN or WEBHOOK_URL not set")
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    data = {
        "url": WEBHOOK_URL,
        "secret_token": BOT_SECRET,
    }
    
    for attempt in range(3):
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                logger.info("Telegram webhook set: %s", response.json())
                return
            else:
                logger.error("Failed to set Telegram webhook: %s", response.text)
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
        time.sleep(2) # Wait before retrying
    raise RuntimeError("Failed to set Telegram webhook after retries")

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
    logger.info("Application initialized, registering handlers...")

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

    # # Schedule listing poster every 5 minutes (300 seconds)
    # application.job_queue.run_repeating(poll_and_post_listings, interval=300, first=10)
    
    # # Schedule notification poster every 1min (60 seconds)
    # application.job_queue.run_repeating(poll_notifications, interval=60, first=5)

    # logger.info("Bot started with polling listing poster and notifications job.")
    # application.run_polling()
    
    # Set Telegram webhook once per deploy/startup
    try:
        logger.info("Setting Telegram webhook...")
        set_telegram_webhook()
    except Exception as e:
        logger.error(f"Failed to set Telegram webhook: {e}")
    
    # Start webhook listener
    try:
        logger.info(f"Starting webhook on 0.0.0.0:{PORT}, URL: {WEBHOOK_URL}")
        await application.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path="/webhook",
            webhook_url=WEBHOOK_URL,
            secret_token=BOT_SECRET,
        )
        logger.info("Webhook server is running")
    except Exception as e:
        logger.error(f"Error while running webhook: {e}", exc_info=True)
        raise
    
if __name__ == "__main__":
    try:
        asyncio.run(start_bot())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot failed: {e}", exc_info=True)