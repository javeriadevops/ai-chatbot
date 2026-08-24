# Entry point of the FastAPI application
from fastapi import FastAPI, HTTPException

from app import config
from app.llm import LLMError, generate_reply
from app.schemas import ChatRequest, ChatResponse
from pathlib import Path

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="AI Chatbot API")

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")
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