const test = require('node:test');
const assert = require('node:assert/strict');
const { createRoomDirectory } = require('../src/rooms');
const { createStore } = require('../src/store');
const { createWall } = require('../src/wall');
const { SEEDS, CHECKS, ROOMS } = require('../lab/scenario');
const { labWall, seededWall } = require('../test-support/lab-wall');

test('every seed message is OK', () => {
  const { wall } = labWall();
  for (const seed of SEEDS) assert.equal(wall.check(seed).verdict, 'OK', seed.id);
});

test('PRD §16: the wall core reproduces every Lab check', () => {
  const { wall } = seededWall();
  for (const check of CHECKS) {
    const result = wall.check(check);
    assert.equal(result.verdict, check.verdict, check.id);
    assert.equal(result.code, check.code, check.id);
    assert.deepEqual(result.sourceRooms, check.source ? [check.source] : [], check.id);
  }
});

test('FR-WALL-001: an agent repeating another room\'s item is a CROSS_ROOM_LEAK', () => {
  const { wall } = seededWall();
  const result = wall.check({ roomId: ROOMS.ZENITH, role: 'assistant', content: 'They pay NGN 4.5m.' });
  assert.equal(result.code, 'CROSS_ROOM_LEAK');
});

test('FR-WALL-002: a human pasting another room\'s item is a CROSS_ROOM_PASTE', () => {
  const { wall } = seededWall();
  const result = wall.check({ roomId: ROOMS.ZENITH, role: 'user', content: 'mail Finance@Acme.ng' });
  assert.equal(result.verdict, 'BLOCKED');
  assert.equal(result.code, 'CROSS_ROOM_PASTE');
});

test('FR-WALL-003: same room and linked rooms are OK', () => {
  const { wall } = seededWall();
  assert.equal(wall.check({ roomId: ROOMS.ACME, role: 'assistant', content: 'Invoices go to finance@acme.ng' }).code, 'SAME_ROOM_OK');
  assert.equal(wall.check({ roomId: ROOMS.ACME_DEV, role: 'user', content: 'Budget: 12k' }).code, 'LINKED_ROOM_OK');
  assert.equal(wall.check({ roomId: ROOMS.ACME_DESIGN, role: 'assistant', content: 'Still $12,000' }).code, 'SAME_ROOM_OK');
});

test('a linked group shares only within itself', () => {
  const { wall } = seededWall();
  assert.equal(wall.check({ roomId: ROOMS.ZENITH, role: 'assistant', content: 'Their budget is $12,000.' }).code, 'CROSS_ROOM_LEAK');
  assert.equal(wall.check({ roomId: ROOMS.ACME, role: 'assistant', content: 'Design has $12,000.' }).code, 'CROSS_ROOM_LEAK');
});

test('FR-WALL-004: an item already passed in 2+ unlinked rooms is common and never blocks', () => {
  const store = createStore();
  const rooms = createRoomDirectory({ linked: { pair: ['c', 'd'] } });
  store.record('a', ['email:hello@example.com']);
  store.record('b', ['email:hello@example.com']);
  const wall = createWall({ rooms, store });
  const result = wall.check({ roomId: 'z', role: 'assistant', content: 'Write to hello@example.com' });
  assert.equal(result.verdict, 'OK');
  assert.equal(result.code, 'CLEAN');
});

test('FR-WALL-004: two rooms of one linked group do not make an item common', () => {
  const store = createStore();
  const rooms = createRoomDirectory({ linked: { pair: ['c', 'd'] } });
  store.record('c', ['amount:900000']);
  store.record('d', ['amount:900000']);
  const wall = createWall({ rooms, store });
  assert.equal(wall.check({ roomId: 'z', role: 'assistant', content: 'about 900k' }).verdict, 'BLOCKED');
});

test('unknown room ids are walled off from each other like any room', () => {
  const wall = createWall({ rooms: createRoomDirectory({}), store: createStore() });
  assert.equal(wall.check({ roomId: 'room-x', role: 'user', content: 'My number is 08035550142' }).verdict, 'OK');
  assert.equal(wall.check({ roomId: 'room-y', role: 'assistant', content: 'Try +234 803 555 0142' }).code, 'CROSS_ROOM_LEAK');
});

test('messages with no items are CLEAN', () => {
  const { wall } = seededWall();
  assert.equal(wall.check({ roomId: ROOMS.ZENITH, role: 'user', content: 'We have 3 items left.' }).code, 'CLEAN');
});
