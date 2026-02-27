"""
Digital Twin AI Agent — A personalized AI that represents a real person.
Deployed as a FastAPI service on HuggingFace Spaces (Docker SDK).
Uses Groq API (Llama 3.3 70B) for fast, free inference.
"""

import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Digital Twin Agent", version="1.0.0")

# --- Configuration ---

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Twin configuration from environment
TWIN_CONFIG = os.environ.get("TWIN_CONFIG", json.dumps({
    "name": "Hitesh",
    "bio": "Builder, hackathon enthusiast, and full-stack developer passionate about AI agents and web3. Love building products that solve real problems.",
    "expertise": ["web3", "AI agents", "full-stack development", "hackathons", "startups"],
    "style": "Friendly, practical, direct. Prefers concrete examples over abstract theory. Often shares personal experience.",
    "topics": ["career advice", "web3 development", "AI/ML", "hackathon tips", "startup building", "learning to code"],
    "boundaries": ["personal financial advice", "medical advice", "legal counsel"]
}))

twin_data = json.loads(TWIN_CONFIG)

SYSTEM_PROMPT = f"""You are the digital twin of {twin_data['name']}. You represent them in conversations.

About {twin_data['name']}:
{twin_data['bio']}

Expertise: {', '.join(twin_data['expertise'])}
Communication style: {twin_data['style']}
Topics you can discuss: {', '.join(twin_data['topics'])}
Topics to avoid: {', '.join(twin_data['boundaries'])}

Always respond authentically as {twin_data['name']} would. If asked something outside your knowledge, say so honestly. Be helpful but maintain the person's actual perspective and values. Keep responses concise but insightful."""


# --- Models ---

class AskRequest(BaseModel):
    question: str = Field(..., description="The question to ask the digital twin")
    context: str | None = Field(None, description="Optional context about the asker")


class AskResponse(BaseModel):
    answer: str
    confidence: float
    topics: list[str]
    twin_name: str


class ProfileResponse(BaseModel):
    name: str
    expertise: list[str]
    bio: str
    topics_available: list[str]


# --- Routes ---

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/profile")
async def get_profile() -> ProfileResponse:
    return ProfileResponse(
        name=twin_data["name"],
        expertise=twin_data["expertise"],
        bio=twin_data["bio"],
        topics_available=twin_data["topics"],
    )


@app.post("/ask")
async def ask(req: AskRequest) -> AskResponse:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]

    user_content = req.question
    if req.context:
        user_content = f"[Context: {req.context}]\n\n{req.question}"

    messages.append({"role": "user", "content": user_content})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Groq API error: {response.status_code}",
            )

        data = response.json()
        answer = data["choices"][0]["message"]["content"]

    # Extract topics from the question (simple keyword matching)
    all_topics = twin_data["topics"] + twin_data["expertise"]
    matched_topics = [
        t for t in all_topics
        if t.lower() in req.question.lower() or any(
            word in req.question.lower() for word in t.lower().split()
        )
    ]
    if not matched_topics:
        matched_topics = ["general"]

    return AskResponse(
        answer=answer,
        confidence=0.85,
        topics=matched_topics[:5],
        twin_name=f"{twin_data['name']}'s Digital Twin",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
