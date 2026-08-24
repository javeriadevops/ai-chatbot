# Temporary script to learn how the Groq API works
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

url = "https://api.groq.com/openai/v1/chat/completions"

headers = {"Authorization": f"Bearer {api_key}"}

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello in one short sentence."},
    ],
}

response = httpx.post(url, headers=headers, json=payload, timeout=30)

print("STATUS:", response.status_code)
print(response.json())