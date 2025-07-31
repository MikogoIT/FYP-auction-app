# File: app.py

import asyncio
from flask import Flask, request, jsonify, abort
from telegram import Update
from main import application, start_bot
from config import WEBHOOK_URL, BOT_SECRET

app = Flask(__name__)

# Start the bot and set webhook during startup
@app.before_first_request
def setup():
    asyncio.run(start_bot())
    asyncio.run(
        application.bot.set_webhook(WEBHOOK_URL, secret_token=BOT_SECRET)
    )
    
# Handle Telegram webhook POST
@app.route("/api/telegram/webhook", methods=["POST"])
def telegram_webhook():
    if request.headers.get("X-Telegram-Bot-Api-Secret-Token") != BOT_SECRET:
        abort(403)
        
    data = request.get_json()
    update = Update.de_json(data, application.bot)
    
    asyncio.run(application.process_update(update))
    
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)