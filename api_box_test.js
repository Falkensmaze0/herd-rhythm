const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
(async () => {
  const res = await fetch('http://localhost:3000/api/ai-agent-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: "What's your superpower?",
      userRole: 'manager',
      tabId: 'analytics'
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
