# telegram/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status, Header
from telegram import Update, BotCommand
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes
)

from logger import logger
from config import TELEGRAM_BOT_TOKEN, WEBHOOK_URL, PORT, BOT_SECRET
from handlers import (
    start, help_command, bid, mybids, bid_increment_fixed, withdraw, mylistings, mywatchlist,
    removewatchlist, handle_free_search, confirm_bid_callback, withdraw_callback_handler,
    watchlist_callback_handler, myrecommendations
)
from jobs import poll_and_post_listings, poll_notifications

def build_application() -> Application:
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN env variable not set")

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("bid", bid))
    app.add_handler(CommandHandler("mybids", mybids))
    app.add_handler(CommandHandler("bidinc", bid_increment_fixed))
    app.add_handler(CallbackQueryHandler(confirm_bid_callback, pattern=r"^confirm_bid_"))
    app.add_handler(CommandHandler("withdraw", withdraw))
    app.add_handler(CallbackQueryHandler(withdraw_callback_handler, pattern=r"^withdraw_"))
    app.add_handler(CommandHandler("mylistings", mylistings))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_free_search))
    app.add_handler(CommandHandler("mywatchlist", mywatchlist))
    app.add_handler(CommandHandler("myrecommendations", myrecommendations))
    app.add_handler(CommandHandler("removewatchlist", removewatchlist))
    app.add_handler(CallbackQueryHandler(watchlist_callback_handler, pattern="^watchlist_"))

application = build_application()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Starting application lifecycle...")
        
        await application.initialize()
        await application.start()
        
        await application.bot.set_webhook(
            url=WEBHOOK_URL,
            secret_token=BOT_SECRET,
        )
        logger.info("Webhook set successfully")
        
        commands = [
            BotCommand("start", "Start or resume"),
            BotCommand("help", "Show help"),
        ]
        await application.bot.set_my_commands(commands)
        logger.info("Bot commands set")
        
        yield # Run the app
        
    finally:
        logger.info("Shutting down application lifecycle...")
        await application.stop()
        await application.shutdown()
        logger.info("Telegram bot shut down")
        
app = FastAPI(lifespan=lifespan)

@app.post("/webhook")
async def webhook(request: Request):
    # Verify Telegram secret token header
    telegram_secret = request.headers.get("x-telegram-bot-api-secret-token")
    if telegram_secret != BOT_SECRET:
        logger.warning("Invalid secret token received in webhook")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid secret token")
    
    data = await request.json()
    update = Update.de_json(data, application.bot)
    await application.process_update(update)
    return {"ok": True}

@app.post("/newListing")
async def new_listing(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {BOT_SECRET}":
        raise HTTPException(status_code=403, detail="Unauthorized")
    await poll_and_post_listings(application.bot)
    return {"status": "poll triggered"}