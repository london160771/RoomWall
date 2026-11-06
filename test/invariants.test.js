const test = require('node:test');
const assert = require('node:assert/strict');
const { toWireResponse } = require('../src/wire');
const { detectItems } = require('../src/detectors');
const { SEEDS, CHECKS, ROOMS } = require('../lab/scenario');
const { labWall, seededWall } = require('../test-support/lab-wall');

test('INV-1: an item first seen in room A never passes in unlinked room B, in any form or role', () => {
  const { wall } = seededWall();
  const forms = ['4.5m', '₦4,500,000', 'N4.5m', 'NGN 4.5m', '4,500,000', 'FINANCE@acme.ng', '**finance@acme.ng**'];
  for (const content of forms) {
    for (const role of ['user', 'assistant']) {
      assert.equal(wall.check({ roomId: ROOMS.ZENITH, role, content }).verdict, 'BLOCKED', `${role}: ${content}`);
    }
  }
});

test('INV-2: a blocked message records nothing', () => {
  const { wall, store } = seededWall();
  const before = store.size();
  const result = wall.check({ roomId: ROOMS.ZENITH, role: 'assistant', content: 'Acme pays 4.5m; also email new@zenith.ng or call 08011112222' });
  assert.equal(result.verdict, 'BLOCKED');
  assert.equal(store.size(), before);
  assert.deepEqual(store.sourcesOf('email:new@zenith.ng'), []);
  assert.deepEqual(store.sourcesOf('amount:4500000'), [ROOMS.ACME]);
});

test('INV-2: a blocked #private message records none of its shingles', () => {
  const { wall, store } = seededWall();
  const before = store.size();
  wall.check({ roomId: ROOMS.ZENITH, role: 'user', content: '#private acme pays 4.5m and here are eight more words to store' });
  assert.equal(store.size(), before);
});

test('INV-2: an OK message records its items under its room', () => {
  const { wall, store } = labWall();
  wall.check({ roomId: ROOMS.ACME, role: 'user', content: 'Our retainer is ₦4,500,000 a month.' });
  assert.deepEqual(store.sourcesOf('amount:4500000'), [ROOMS.ACME]);
});

test('INV-3: checks are deterministic', () => {
  const runs = [seededWall(), seededWall()].map(({ wall }) => CHECKS.map((check) => wall.check(check)));
  assert.deepEqual(runs[0], runs[1]);
});

test('INV-3: a check takes under 100 ms with 1,000 stored items (target)', () => {
  const { wall, store } = labWall();
  const keys = Array.from({ length: 1000 }, (_, index) => `email:user${index}@acme.ng`);
  store.record(ROOMS.ACME, keys);
  const long = `${'Please review the plan for the next sprint today and '.repeat(40)} user999@acme.ng`;
  const started = process.hrtime.bigint();
  const result = wall.check({ roomId: ROOMS.ZENITH, role: 'assistant', content: long });
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  assert.equal(result.verdict, 'BLOCKED');
  assert.ok(elapsedMs < 100, `took ${elapsedMs} ms`);
});

test('INV-4: wire findings carry only the category, never the room name or the secret', () => {
  const { wall, rooms } = seededWall();
  const secrets = SEEDS.flatMap((seed) => detectItems(seed.content).filter((entry) => entry.recordable).map((entry) => entry.key.split(':').slice(1).join(':')));
  const names = Object.values(ROOMS).flatMap((roomId) => [roomId, rooms.nameOf(roomId)]);
  for (const check of CHECKS) {
    const wire = toWireResponse(wall.check(check));
    const text = JSON.stringify(wire).toLowerCase();
    for (const finding of wire.findings) assert.ok(['cross-room-leak', 'cross-room-paste'].includes(finding.category));
    for (const name of names) assert.ok(!text.includes(name.toLowerCase()), `${check.id} leaks room ${name}`);
    for (const secret of secrets) assert.ok(!text.includes(secret), `${check.id} leaks ${secret}`);
    for (const raw of ['4.5m', '4,500,000', 'finance@acme.ng', 'bluebird', '0142']) assert.ok(!text.includes(raw), `${check.id} leaks ${raw}`);
  }
});

test('INV-5: plain small numbers never block', () => {
  const { wall } = labWall();
  wall.check({ roomId: ROOMS.ACME, role: 'user', content: 'We need 3 designers and 12 pages.' });
  assert.equal(wall.check({ roomId: ROOMS.ZENITH, role: 'assistant', content: 'You need 3 designers and 12 pages.' }).verdict, 'OK');
});
