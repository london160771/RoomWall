const path = require('node:path');
const { loadRoomDirectory } = require('../src/rooms');
const { createStore } = require('../src/store');
const { createWall } = require('../src/wall');
const { SEEDS } = require('../lab/scenario');

const LAB_ROOMS_FILE = path.join(__dirname, '..', 'lab', 'rooms.json');

function labWall() {
  const store = createStore();
  const rooms = loadRoomDirectory(LAB_ROOMS_FILE);
  return { wall: createWall({ rooms, store }), store, rooms };
}

function seededWall() {
  const context = labWall();
  for (const seed of SEEDS) context.wall.check(seed);
  return context;
}

module.exports = { labWall, seededWall, LAB_ROOMS_FILE };
