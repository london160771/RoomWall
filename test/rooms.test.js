const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { createRoomDirectory, loadRoomDirectory, RoomsConfigError } = require('../src/rooms');

const config = { rooms: { a: 'client-a', b: 'client-b', d1: 'design', d2: 'dev' }, linked: { internal: ['d1', 'd2'] } };

test('FR-CFG-001: known rooms use their friendly names', () => {
  assert.equal(createRoomDirectory(config).nameOf('a'), 'client-a');
});

test('FR-CFG-001: unknown room ids still work and are shown by short id', () => {
  const rooms = createRoomDirectory(config);
  assert.equal(rooms.nameOf('2a879062-5736-4085-a6f1-ee7659e3da8e'), '2a879062');
  assert.equal(rooms.areLinked('unknown-1', 'unknown-2'), false);
});

test('FR-CFG-001: rooms in the same linked group are linked, others are not', () => {
  const rooms = createRoomDirectory(config);
  assert.equal(rooms.areLinked('d1', 'd2'), true);
  assert.equal(rooms.areLinked('a', 'b'), false);
  assert.equal(rooms.areLinked('a', 'd1'), false);
  assert.equal(rooms.areLinked('d1', 'd1'), false);
});

test('an empty config works', () => {
  assert.equal(createRoomDirectory({}).nameOf('abcdefghij'), 'abcdefgh');
});

test('invalid configs fail with a clear error', () => {
  assert.throws(() => createRoomDirectory({ linked: { x: 'a' } }), RoomsConfigError);
  assert.throws(() => createRoomDirectory({ linked: { x: ['a'], y: ['a'] } }), RoomsConfigError);
  assert.throws(() => createRoomDirectory({ rooms: [] }), RoomsConfigError);
});

test('the shipped rooms.json and lab/rooms.json load', () => {
  const root = path.join(__dirname, '..');
  assert.equal(loadRoomDirectory(path.join(root, 'rooms.json')).nameOf('2a879062-5736-4085-a6f1-ee7659e3da8e'), 'town-square');
  assert.equal(loadRoomDirectory(path.join(root, 'lab', 'rooms.json')).areLinked('room-acme-design', 'room-acme-dev'), true);
});

test('a rooms.json saved with a UTF-8 byte order mark (Windows PowerShell 5) still loads', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'roomwall-')), 'rooms.json');
  fs.writeFileSync(file, `\uFEFF${JSON.stringify({ rooms: { abc: 'client-acme' } })}`);
  assert.equal(loadRoomDirectory(file).nameOf('abc'), 'client-acme');
});
