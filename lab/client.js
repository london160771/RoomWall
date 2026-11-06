const LAB_API_KEY = 'roomwall-lab';

async function postCheck(baseUrl, { roomId, role, content }) {
  const response = await fetch(`${baseUrl}/guardrails/check`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-agent-session-id': roomId,
      'x-guardrails-policy-id': 'roomwall',
      'x-flintai-api-key': LAB_API_KEY,
      'x-agent-name': 'lab-agent',
      'x-agent-turn-id': crypto.randomUUID(),
    },
    body: JSON.stringify({ messages: [{ role, content }] }),
  });
  if (!response.ok) throw new Error(`RoomWall answered HTTP ${response.status} for ${roomId}`);
  return response.json();
}

module.exports = { postCheck };
