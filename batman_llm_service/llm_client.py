import httpx
from typing import Optional, Dict

OLLAMA_MODEL = "qwen2.5-coder:14b-instruct-q6_K"
OLLAMA_ENDPOINT = "/api/generate"

async def complete_with_llm(
    prompt: str,
    system_prompt: str,
    api_base: str,
    api_key: Optional[str] = None,
    user_params: Optional[Dict] = None
) -> str:
    full_prompt = (
        f"System: {system_prompt}\nUser (role={user_params.get('userRole','')} tab={user_params.get('tabId','')}): {prompt}"
        if user_params
        else f"System: {system_prompt}\nUser: {prompt}"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": full_prompt
    }

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    async with httpx.AsyncClient() as client:
        url = api_base.rstrip("/") + OLLAMA_ENDPOINT
        resp = await client.post(url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
                data = resp.json()
        # Aggregate plain response
        return data.get("response", "").strip()

