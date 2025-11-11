# Batman LLM Service

A modular, scalable FastAPI wrapper for LLMs that sets the system prompt to "you're batman". Receives prompt and user context parameters from UI, communicates with any OpenAI-compatible backend.

## Quick Start

1. Copy `.env.example` to `.env` and set your API base/key.
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the service:
   ```sh
   uvicorn main:app --reload
   ```

## Endpoint

- **POST /v1/completions**
  - Request body: `{ "prompt": "your prompt", "userRole": "role", "tabId": "analytics" }`
  - Returns: `{ "result": "LLM text" }`

## Configuration
- System prompt always set to "you're batman"
- LLM provider and API key from `.env`

## Modularity
- All LLM calls are via `llm_client.py`, can be extended for other models/providers, batch, caching, etc.

## Scalability
- Ready for multi-instance, docker/cloud deployment.
- Can support auth, rate-limiting, streaming, persistent context, etc.

