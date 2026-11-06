const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../src/server');
const { formatCheck } = require('../src/log');
const { LAB_ROOMS_FILE } = require('../test-support/lab-wall');

const HEADERS = {
  'content-type': 'application/json',
  'x-agent-session-id': 'room-acme',
  'x-guardrails-policy-id': 'roomwall',
  'x-flintai-api-key': 'any-key',
  'x-agent-name': 'wall-agent',
  'x-agent-turn-id': 'turn-1',
};

async function withServer(run) {
  const log = [];
  const server = await startServer({ port: 0, roomsFile: LAB_ROOMS_FILE, onCheck: (entry) => log.push(entry) });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run({ base, log });
  } finally {
    server.close();
  }
}

function post(base, { headers = HEADERS, body }) {
  return fetch(`${base}/guardrails/check`, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
}

const message = (role, content) => ({ messages: [{ role, content }] });

test('GET /health answers {"ok":true}', () => withServer(async ({ base }) => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
}));

test('§12: an OK check returns exactly the Switch response shape', () => withServer(async ({ base }) => {
  const response = await post(base, { body: message('user', 'Our retainer is ₦4,500,000 a month.') });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), {
    outcome: 'GUARDRAIL_RESULT_OUTCOME_OK', policy_id: 'roomwall', policy_name: 'RoomWall', findings: [],
  });
}));

test('§12 + INV-4: a cross-room leak returns BLOCKED with only the category', () => withServer(async ({ base }) => {
  await post(base, { body: message('user', 'Our retainer is ₦4,500,000 a month.') });
  const response = await post(base, { headers: { ...HEADERS, 'x-agent-session-id': 'room-zenith' }, body: message('assistant', 'Acme pays 4.5m.') });
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(text), {
    outcome: 'GUARDRAIL_RESULT_OUTCOME_BLOCKED',
    policy_id: 'roomwall',
    policy_name: 'RoomWall',
    findings: [{ category: 'cross-room-leak', detector_name: 'roomwall', severity: 'high' }],
  });
  for (const forbidden of ['acme', '4.5m', '4500000']) assert.ok(!text.toLowerCase().includes(forbidden), forbidden);
}));

test('a human paste returns BLOCKED with cross-room-paste', () => withServer(async ({ base }) => {
  await post(base, { body: message('user', 'Send invoices to finance@acme.ng please.') });
  const response = await post(base, { headers: { ...HEADERS, 'x-agent-session-id': 'room-zenith' }, body: message('user', 'mail finance@acme.ng') });
  assert.equal((await response.json()).findings[0].category, 'cross-room-paste');
}));

test('FR-API-002: a missing or empty API key is 401 UNAUTHORIZED', () => withServer(async ({ base }) => {
  const { 'x-flintai-api-key': omitted, ...withoutKey } = HEADERS;
  for (const headers of [withoutKey, { ...HEADERS, 'x-flintai-api-key': '   ' }]) {
    const response = await post(base, { headers, body: message('user', 'hi') });
    assert.equal(response.status, 401, omitted);
    assert.equal((await response.json()).error.code, 'UNAUTHORIZED');
  }
}));

test('FR-API-002: malformed requests are 400 BAD_REQUEST and never crash the server', () => withServer(async ({ base, log }) => {
  const { 'x-agent-session-id': omittedRoom, ...withoutRoom } = HEADERS;
  const cases = [
    { body: '{not json' },
    { body: {} },
    { body: { messages: [] } },
    { body: { messages: 'hi' } },
    { body: { messages: [{ role: 'system', content: 'hi' }] } },
    { body: { messages: [{ role: 'user', content: 42 }] } },
    { body: { messages: [null] } },
    { body: 'null' },
    { headers: withoutRoom, body: message('user', 'hi') },
  ];
  for (const request of cases) {
    const response = await post(base, request);
    assert.equal(response.status, 400, `${JSON.stringify(request.body)} ${omittedRoom}`);
    assert.equal((await response.json()).error.code, 'BAD_REQUEST');
  }
  assert.equal(log.length, 0);
  assert.equal((await fetch(`${base}/health`)).status, 200);
}));

test('INV-2 over HTTP: a request with any blocked message records none of its messages', () => withServer(async ({ base }) => {
  await post(base, { body: message('user', 'Our retainer is ₦4,500,000 a month.') });
  const zenith = { ...HEADERS, 'x-agent-session-id': 'room-zenith' };
  const mixed = { messages: [{ role: 'user', content: 'call 08099998888' }, { role: 'assistant', content: 'Acme pays 4.5m' }] };
  assert.equal((await (await post(base, { headers: zenith, body: mixed })).json()).outcome, 'GUARDRAIL_RESULT_OUTCOME_BLOCKED');
  const acme = await post(base, { body: message('assistant', 'try 08099998888') });
  assert.equal((await acme.json()).outcome, 'GUARDRAIL_RESULT_OUTCOME_OK');
}));

test('unknown room ids are accepted', () => withServer(async ({ base, log }) => {
  const response = await post(base, { headers: { ...HEADERS, 'x-agent-session-id': '2a879062-5736-4085-a6f1-ee7659e3da8e' }, body: message('user', 'hello') });
  assert.equal(response.status, 200);
  assert.equal(log[0].roomName, '2a879062');
}));

test('unknown routes are 404 JSON', () => withServer(async ({ base }) => {
  const response = await fetch(`${base}/nope`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'NOT_FOUND');
}));

test('FR-LOG-001: each check logs time, room name and id, role, verdict, code and source', () => withServer(async ({ base, log }) => {
  await post(base, { body: message('user', 'Our retainer is ₦4,500,000 a month.') });
  await post(base, { headers: { ...HEADERS, 'x-agent-session-id': 'room-zenith' }, body: message('assistant', 'Acme pays 4.5m.') });
  const [first, second] = log.map(formatCheck);
  assert.match(first, /^--- .+ POST \/guardrails\/check\nroom: client-acme \(room-acme\) \| role: user\nverdict: OK \| code: CLEAN \| \d+\.\d ms$/);
  assert.match(second, /room: client-zenith \(room-zenith\) \| role: assistant\nverdict: BLOCKED \| code: CROSS_ROOM_LEAK \| source: client-acme \| items: amount \| \d+\.\d ms$/);
  assert.ok(!second.includes('4.5m'));
}));
