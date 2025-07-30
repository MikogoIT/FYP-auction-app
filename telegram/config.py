# File: config.py

from dotenv import load_dotenv
import os, requests

load_dotenv() # Load .env into environment variables

# Load Environment Variables
BOT_SECRET = os.getenv("BOT_SECRET")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://host.docker.internal:4433")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
PORT = int(os.getenv("PORT", 8443))
WEBHOOK_URL = os.getenv("WEBHOOK_URL") # No default, must be set in prod