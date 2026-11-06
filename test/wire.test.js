const test = require('node:test');
const assert = require('node:assert/strict');
const { toWireResponse } = require('../src/wire');

test('§12: an OK verdict maps to the exact Switch response shape', () => {
  assert.deepEqual(toWireResponse({ verdict: 'OK', code: 'CLEAN' }), {
    outcome: 'GUARDRAIL_RESULT_OUTCOME_OK',
    policy_id: 'roomwall',
    policy_name: 'RoomWall',
    findings: [],
  });
});

test('§12: a leak maps to BLOCKED with one cross-room-leak finding', () => {
  assert.deepEqual(toWireResponse({ verdict: 'BLOCKED', code: 'CROSS_ROOM_LEAK', sourceRooms: ['room-acme'] }), {
    outcome: 'GUARDRAIL_RESULT_OUTCOME_BLOCKED',
    policy_id: 'roomwall',
    policy_name: 'RoomWall',
    findings: [{ category: 'cross-room-leak', detector_name: 'roomwall', severity: 'high' }],
  });
});

test('§12: a paste maps to BLOCKED with one cross-room-paste finding', () => {
  assert.equal(toWireResponse({ verdict: 'BLOCKED', code: 'CROSS_ROOM_PASTE' }).findings[0].category, 'cross-room-paste');
});
