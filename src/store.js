function createStore() {
  const roomsByKey = new Map();

  function record(roomId, keys) {
    for (const key of keys) {
      const rooms = roomsByKey.get(key) ?? [];
      if (!rooms.includes(roomId)) rooms.push(roomId);
      roomsByKey.set(key, rooms);
    }
  }

  const sourcesOf = (key) => [...(roomsByKey.get(key) ?? [])];
  const size = () => roomsByKey.size;

  return { record, sourcesOf, size };
}

module.exports = { createStore };
