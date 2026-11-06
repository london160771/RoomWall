const fs = require('node:fs');
const { SHORT_ID_LENGTH } = require('./config');

const BYTE_ORDER_MARK = /^\uFEFF/;

class RoomsConfigError extends Error {}

function assertObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new RoomsConfigError(`${label} must be an object`);
  }
}

function groupIndex(linked) {
  const groupOf = new Map();
  for (const [group, members] of Object.entries(linked)) {
    if (!Array.isArray(members)) throw new RoomsConfigError(`linked.${group} must be an array of room ids`);
    for (const roomId of members) {
      if (groupOf.has(roomId)) throw new RoomsConfigError(`room ${roomId} is in more than one linked group`);
      groupOf.set(roomId, group);
    }
  }
  return groupOf;
}

function createRoomDirectory(config = {}) {
  assertObject(config, 'rooms config');
  const names = config.rooms ?? {};
  const linked = config.linked ?? {};
  assertObject(names, 'rooms');
  assertObject(linked, 'linked');
  const groupOf = groupIndex(linked);

  const nameOf = (roomId) => names[roomId] ?? roomId.slice(0, SHORT_ID_LENGTH);
  const wallOf = (roomId) => (groupOf.has(roomId) ? `group:${groupOf.get(roomId)}` : `room:${roomId}`);
  const areLinked = (a, b) => a !== b && wallOf(a) === wallOf(b);

  return { nameOf, wallOf, areLinked };
}

function loadRoomDirectory(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(BYTE_ORDER_MARK, '');
  return createRoomDirectory(JSON.parse(raw));
}

module.exports = { createRoomDirectory, loadRoomDirectory, RoomsConfigError };
