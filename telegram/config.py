# File: config.py

from dotenv import load_dotenv
import os, requests

load_dotenv() # Load .env into environment variables

md_url   = "http://metadata.google.internal/computeMetadata/v1/instance/hostname"
headers  = {"Metadata-Flavor": "Google"}
host     = requests.get(md_url, headers=headers).text

# Load Environment Variables
BOT_SECRET = os.getenv("BOT_SECRET")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://host.docker.internal:4433")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
PORT = int(os.getenv("TELE_PORT", 8443))
WEBHOOK_URL = f"https://{host}" # No default, must be set in prod