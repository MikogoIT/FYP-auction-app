# telegram/handlers/recommendations.py

from telegram import Update
from telegram.ext import ContextTypes
from api import fetch_recommendations
from utils import require_telegram_link, format_recommendations_message
        
async def myrecommendations(update: Update, context: ContextTypes.DEFAULT_TYPE):
    linked_data = await require_telegram_link(update, context)
    if not linked_data:
        return # Early return if not linked
    
    user_id = linked_data["user_id"]
    
    recommendations = await fetch_recommendations(user_id, limit=5)
    
    if not recommendations:
        await update.message.reply_text("No recommendations found at the moment.")
        
    message = format_recommendations_message(recommendations)
    await update.message.reply_text(message, parse_mode="HTML")
    