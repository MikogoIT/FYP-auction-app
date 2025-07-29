# File: handlers/free_search.py

from logger import logger
import json
import time
import httpx
from telegram import Update
from telegram.ext import ContextTypes
from config import OPENROUTER_API_KEY
from api import search_listings

# Simple in-memory cache with expiry (10 mins)
# Key: user_input str, Value: parsed filters dict + timestamp
cache = {}
CACHE_TTL_SECONDS = 600

"""Send free-form user input to GPT and get structured filter."""
async def parse_natural_query(user_input: str):
    now = time.time()
    key = user_input.strip().lower() # normalize cache key
    
    # Check cache first
    cached = cache.get(key)
    if cached and now - cached["timestamp"] < CACHE_TTL_SECONDS:
        logger.info("Using cached OpenRouter result for user input")
        return cached["filters"]
    
    system_prompt = (
        "You are a helpful assistant that extracts search filters from auction queries. "
        "Respond ONLY with a valid JSON object with keys: 'category' (string or null), "
        "'max_price' (number or null), and 'keywords' (array of strings). "
        "Do NOT include any explanation or text, just JSON."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_input},
    ]
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "qwen/qwen3-coder:free",
        "messages": messages,
        "temperature": 0.2,
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            filters = json.loads(content)
    
            # Cache it
            cache[key] = {"filters": filters, "timestamp": now}
            return filters
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON from GPT: {content}")
        except Exception as e:
            logger.error(f"GPT parsing error: {e}")
        return None
    
async def handle_free_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    await update.message.reply_text("🤖 Let me find that for you...")
    
    filters = await parse_natural_query(user_text)
    if not filters:
        await update.message.reply_text("❌ I couldn't understand your query. Try being more specific.")
        return
    
    logger.info(f"Parsed filters: {filters}")
    
    # Example expected output:
    # { "category": "shoes", "max_price": 200, "keywords": ["nike", "blue"] }
    
    # Extract filter values safely
    category = filters.get("category") or None
    max_price = filters.get("max_price")
    keywords = filters.get("keywords") or []
    
    # Summary message to tell users what GPT is searching for
    summary = "Searching listings"
    if category:
        summary += f" in category '{category}'"
    if max_price:
        summary += f" under $${max_price}"
    if keywords:
        summary += f" with keywords: {', '.join(keywords)}"
    summary += "..."
    await update.message.reply_text(summary)
    
    data = await search_listings(category, max_price, keywords)
    listings = data.get("listings", [])
    
    if not listings:
        await update.message.reply_text("No results found. Try using different keywords, categories or price ranges.")
        return
    
    for listing in listings[:5]: # limit to 5 results
        from utils import format_listing_message
        photo_url, caption, reply_markup = format_listing_message(listing)
        await update.message.reply_photo(
            photo=photo_url,
            caption=caption,
            parse_mode="HTML",
            reply_markup=reply_markup
        )