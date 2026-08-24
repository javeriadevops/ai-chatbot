# All settings are read from environment variables, never hardcoded
import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
BASE_URL = "https://api.groq.com/openai/v1"
MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-20b")
SYSTEM_PROMPT = "You are a helpful assistant. Answer clearly and briefly."