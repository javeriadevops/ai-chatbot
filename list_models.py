# Temporary script to see which models this API key can access
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

response = httpx.get(
    "https://api.groq.com/openai/v1/models",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=30,
)

for model in response.json()["data"]:
    print(model["id"])