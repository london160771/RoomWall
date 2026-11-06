const { CODES, VERDICTS, ROLES, COMMON_ITEM_WALLS } = require('./config');
const { detectItems } = require('./detectors');

const ITEM_STATUS = { NEW: 'new', SAME: 'same', LINKED: 'linked', COMMON: 'common', FOREIGN: 'foreign' };

function itemStatus(sources, roomId, rooms) {
  if (sources.length === 0) return ITEM_STATUS.NEW;
  if (sources.includes(roomId)) return ITEM_STATUS.SAME;
  if (sources.some((source) => rooms.areLinked(source, roomId))) return ITEM_STATUS.LINKED;
  const walls = new Set(sources.map(rooms.wallOf));
  if (walls.size >= COMMON_ITEM_WALLS) return ITEM_STATUS.COMMON;
  return ITEM_STATUS.FOREIGN;
}

function okCode(statuses) {
  if (statuses.includes(ITEM_STATUS.LINKED)) return CODES.LINKED_ROOM_OK;
  if (statuses.includes(ITEM_STATUS.SAME)) return CODES.SAME_ROOM_OK;
  return CODES.CLEAN;
}

function evaluate({ roomId, role, items, sourcesOf, rooms }) {
  const assessed = items.map((entry) => {
    const sources = sourcesOf(entry.key);
    return { ...entry, sources, status: itemStatus(sources, roomId, rooms) };
  });
  const leaks = assessed.filter((entry) => entry.status === ITEM_STATUS.FOREIGN);
  if (leaks.length > 0) {
    const code = role === ROLES.ASSISTANT ? CODES.CROSS_ROOM_LEAK : CODES.CROSS_ROOM_PASTE;
    const sourceRooms = [...new Set(leaks.map((entry) => entry.sources[0]))];
    return { verdict: VERDICTS.BLOCKED, code, sourceRooms, matches: leaks };
  }
  return { verdict: VERDICTS.OK, code: okCode(assessed.map((entry) => entry.status)), sourceRooms: [], matches: [] };
}

function createWall({ rooms, store }) {
  function check({ roomId, role, content }) {
    const items = detectItems(content);
    const result = evaluate({ roomId, role, items, sourcesOf: store.sourcesOf, rooms });
    if (result.verdict === VERDICTS.OK) {
      store.record(roomId, items.filter((entry) => entry.recordable).map((entry) => entry.key));
    }
    return result;
  }
  return { check };
}

module.exports = { createWall, evaluate, ITEM_STATUS };
