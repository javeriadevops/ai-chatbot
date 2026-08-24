# Entry point of the FastAPI application
from fastapi import FastAPI, HTTPException

from app import config
from app.llm import LLMError, generate_reply
from app.schemas import ChatRequest, ChatResponse

app = FastAPI(title="AI Chatbot API")


@app.get("/health")
async def health():
    return {"status": "ok", "model": config.MODEL}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    try:
        reply = await generate_reply(request.messages)
    except LLMError as error:
        raise HTTPException(status_code=502, detail=str(error))

    return ChatResponse(reply=reply, model=config.MODEL)