from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

api_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPEN_ROUTER_KEY")
if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY (or OPEN_ROUTER_KEY) not found in .env")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

MODEL = os.environ.get("OPENROUTER_MODEL", "poolside/laguna-s-2.1:free")

SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are Agent, a helpful, friendly, and concise AI assistant. "
        "Answer the user's questions clearly and directly."
    ),
}

app = FastAPI(title="Agent Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    model: str | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


def get_session(session_id: str | None) -> list:
    if not session_id:
        session_id = str(uuid.uuid4())
    if session_id not in sessions:
        sessions[session_id] = [dict(SYSTEM_PROMPT)]
    return session_id, sessions[session_id]


@app.post("/chat")
def chat(req: ChatRequest):
    session_id, history = get_session(req.session_id)

    history.append({"role": "user", "content": req.message})

    response = client.chat.completions.create(
        model=req.model or MODEL,
        messages=history,
    )

    answer = response.choices[0].message.content
    history.append({"role": "assistant", "content": answer})

    return ChatResponse(reply=answer, session_id=session_id)


@app.post("/reset")
def reset(req: dict):
    session_id = req.get("session_id")
    if session_id and session_id in sessions:
        del sessions[session_id]
    return {"ok": True}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}