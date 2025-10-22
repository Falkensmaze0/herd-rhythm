import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from llm_client import complete_with_llm

load_dotenv()

LLM_API_BASE = os.getenv("LLM_apiBase")
LLM_API_KEY = os.getenv("LLM_apiKey")  # Optional

if not LLM_API_BASE:
    raise RuntimeError("LLM_apiBase must be set in environment")

SYSTEM_PROMPT = "you're batman"

class CompletionRequest(BaseModel):
    prompt: str
    userRole: Optional[str] = None
    tabId: Optional[str] = None

app = FastAPI(title="Batman LLM Service")

@app.post("/v1/completions")
async def completions(req: CompletionRequest):
    payload = {
        "system_prompt": SYSTEM_PROMPT,
        "prompt": req.prompt,
        "userRole": req.userRole,
        "tabId": req.tabId
    }
    try:
        result = await complete_with_llm(
            prompt=req.prompt,
            system_prompt=SYSTEM_PROMPT,
            api_base=LLM_API_BASE,
            api_key=LLM_API_KEY,
            user_params={"userRole": req.userRole, "tabId": req.tabId}
        )
        print(f"[LLM Result] {result}")
        return JSONResponse({"result": result or "(empty reply)"})
    except Exception as e:
        print(f"[LLM Error] {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/")
async def root():
    return {"service": "Batman LLM", "status": "ok"}