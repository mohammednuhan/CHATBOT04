import json
import os
import uuid
from datetime import datetime
from typing import Literal, Optional

from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPEN_ROUTER_KEY")
if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY (or OPEN_ROUTER_KEY) not found in .env")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

MODEL = os.environ.get("OPENROUTER_MODEL", "openrouter/free:free")

SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are Agent, a helpful, friendly, and concise AI assistant. "
        "You have a long-term memory of facts about the user. Use that "
        "memory to personalize your answers and sound natural. If you "
        "don't know something, say so."
    ),
}

MEMORY_EXTRACTION_PROMPT = (
    "Review the conversation and extract the important facts the user has "
    "shared about themselves: their name, identity, preferences, opinions, "
    "goals, projects, job, or anything useful to remember for future answers. "
    "Keep each fact a short, standalone sentence. "
    "Return ONLY a JSON array, no markdown, in this exact format:\n"
    '[{"text": "fact sentence", "category": "preference|fact|goal|project|identity"}]\n'
    "Include the existing memories that are still true (merge duplicates), "
    "plus any new facts. If nothing important, return []."
)

CATEGORIES = ("preference", "fact", "goal", "project", "identity")

app = FastAPI(title="Agent Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversations = {}
memories = {}


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    model: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


class MemoryRequest(BaseModel):
    session_id: str
    text: str
    category: Literal["preference", "fact", "goal", "project", "identity"] = "fact"


class MemoryDeleteRequest(BaseModel):
    session_id: str
    id: str


class ResetRequest(BaseModel):
    session_id: Optional[str] = None


def get_session(session_id: Optional[str]) -> str:
    if not session_id:
        session_id = str(uuid.uuid4())
    conversations.setdefault(session_id, [])
    memories.setdefault(session_id, [])
    return session_id


def build_messages(session_id: str) -> list:
    msgs = [dict(SYSTEM_PROMPT)]
    mems = memories.get(session_id, [])
    if mems:
        lines = [f"- {m['text']}" for m in mems]
        msgs.append(
            {
                "role": "system",
                "content": "Facts I remember about the user:\n" + "\n".join(lines),
            }
        )
    msgs.extend(conversations.get(session_id, []))
    return msgs


def extract_memories(session_id: str) -> None:
    mems = memories.get(session_id, [])
    convo = conversations.get(session_id, [])
    if not convo:
        return

    recent = convo[-20:]
    existing = [m["text"] for m in mems]

    prompt = (
        MEMORY_EXTRACTION_PROMPT
        + "\n\nExisting memories:\n"
        + json.dumps(existing)
        + "\n\nConversation:\n"
        + "\n".join(f"{m['role']}: {m['content']}" for m in recent)
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You extract structured memory facts."},
                {"role": "user", "content": prompt},
            ],
        )
        text = response.choices[0].message.content or ""
        start, end = text.find("["), text.rfind("]")
        if start == -1 or end <= start:
            return

        items = json.loads(text[start : end + 1])
        updated = []
        for it in items:
            if isinstance(it, dict):
                txt = str(it.get("text", "")).strip()
                cat = str(it.get("category", "fact")).strip()
            else:
                txt = str(it).strip()
                cat = "fact"
            if txt:
                if cat not in CATEGORIES:
                    cat = "fact"
                updated.append(
                    {
                        "id": str(uuid.uuid4()),
                        "text": txt,
                        "category": cat,
                        "time": datetime.now().isoformat(timespec="seconds"),
                    }
                )
        if updated:
            memories[session_id] = updated[:30]
    except Exception:
        pass


@app.post("/chat")
def chat(req: ChatRequest, background_tasks: BackgroundTasks):
    session_id = get_session(req.session_id)
    conversations[session_id].append({"role": "user", "content": req.message})

    response = client.chat.completions.create(
        model=req.model or MODEL,
        messages=build_messages(session_id),
    )

    answer = response.choices[0].message.content
    conversations[session_id].append({"role": "assistant", "content": answer})
    background_tasks.add_task(extract_memories, session_id)

    return ChatResponse(reply=answer, session_id=session_id)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest, background_tasks: BackgroundTasks):
    session_id = get_session(req.session_id)
    conversations[session_id].append({"role": "user", "content": req.message})

    def event_stream():
        full = ""
        try:
            stream = client.chat.completions.create(
                model=req.model or MODEL,
                messages=build_messages(session_id),
                stream=True,
            )
            for chunk in stream:
                choices = getattr(chunk, "choices", None)
                if not choices:
                    continue
                delta = getattr(choices[0], "delta", None)
                content = getattr(delta, "content", None) if delta else None
                if content:
                    full += content
                    yield f"data: {json.dumps({'delta': content})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        conversations[session_id].append({"role": "assistant", "content": full})
        yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"

    background_tasks.add_task(extract_memories, session_id)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/memories")
def get_memories(session_id: str):
    return {"memories": memories.get(session_id, [])}


@app.post("/memories")
def add_memory(req: MemoryRequest):
    session_id = get_session(req.session_id)
    memories[session_id].append(
        {
            "id": str(uuid.uuid4()),
            "text": req.text.strip(),
            "category": req.category,
            "time": datetime.now().isoformat(timespec="seconds"),
        }
    )
    return {"memories": memories[session_id]}


@app.post("/memories/delete")
def delete_memory(req: MemoryDeleteRequest):
    session_id = get_session(req.session_id)
    memories[session_id] = [
        m for m in memories.get(session_id, []) if m["id"] != req.id
    ]
    return {"memories": memories.get(session_id, [])}


@app.post("/memories/clear")
def clear_memories(req: ResetRequest):
    session_id = get_session(req.session_id)
    memories[session_id] = []
    return {"memories": []}


@app.post("/reset")
def reset(req: ResetRequest):
    session_id = req.session_id
    if session_id:
        conversations.pop(session_id, None)
        memories.pop(session_id, None)
    return {"ok": True}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}