import type { NextApiRequest, NextApiResponse } from 'next';

// Use native fetch (Node 18+)
const LLM_BACKEND_URL = 'http://localhost:8080/v1/completions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, userRole, tabId } = req.body || {};
  if (
    typeof prompt !== 'string' ||
    typeof userRole !== 'string' ||
    typeof tabId !== 'string'
  ) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  // Proxy request to Python LLM backend
  try {
    const llmResp = await fetch(LLM_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userRole, tabId })
    });
    const data = await llmResp.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to contact LLM agent', details: String(e) });
  }
}