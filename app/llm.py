# Handles all communication with the Groq API
import httpx

from app import config
from app.schemas import Message


class LLMError(Exception):
    """Raised when the Groq API call fails."""


async def generate_reply(messages: list[Message]) -> str:
    if not config.API_KEY:
        raise LLMError("GROQ_API_KEY is missing. Check your .env file.")

    url = f"{config.BASE_URL}/chat/completions"
    headers = {"Authorization": f"Bearer {config.API_KEY}"}

    chat_messages = [{"role": "system", "content": config.SYSTEM_PROMPT}]
    for m in messages:
        chat_messages.append({"role": m.role, "content": m.content})

    payload = {"model": config.MODEL, "messages": chat_messages}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise LLMError(f"Groq returned status {response.status_code}")

    data = response.json()
    return data["choices"][0]["message"]["content"]