// RoomWall Gate 0 stub: proves Switch calls our guardrails endpoint.
// Run: node gate0.js   (no npm install needed)
const http = require('http');

http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    let content = '';
    try { content = JSON.parse(body).messages?.[0]?.content || ''; } catch {}
    const room = req.headers['x-agent-session-id'];
    const blocked = content.includes('SECRET');

    console.log('---', new Date().toLocaleTimeString(), req.method, req.url);
    console.log('room:', room, '| role:', (() => { try { return JSON.parse(body).messages[0].role; } catch { return '?'; } })());
    console.log('content:', content);
    console.log('verdict:', blocked ? 'BLOCKED' : 'OK');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      outcome: blocked ? 'GUARDRAIL_RESULT_OUTCOME_BLOCKED' : 'GUARDRAIL_RESULT_OUTCOME_OK',
      policy_id: 'roomwall',
      policy_name: 'RoomWall',
      findings: blocked
        ? [{ category: 'cross-room-leak', detector_name: 'roomwall', severity: 'high' }]
        : [],
    }));
  });
}).listen(8787, () => console.log('RoomWall Gate 0 stub listening on http://localhost:8787'));