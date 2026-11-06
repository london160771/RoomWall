const path = require('node:path');
const { DEFAULT_PORT, DEFAULT_ROOMS_FILE } = require('./config');
const { loadRoomDirectory } = require('./rooms');
const { createStore } = require('./store');
const { createWall } = require('./wall');
const { createApp } = require('./app');
const { consoleLogger } = require('./log');

async function startServer({ port = DEFAULT_PORT, roomsFile = DEFAULT_ROOMS_FILE, onCheck = consoleLogger } = {}) {
  const rooms = loadRoomDirectory(path.resolve(roomsFile));
  const wall = createWall({ rooms, store: createStore() });
  const app = createApp({ wall, rooms, onCheck });
  return new Promise((resolve, reject) => {
    const server = app.listen(port, (error) => (error ? reject(error) : resolve(server)));
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const roomsFile = process.env.ROOMS_FILE ?? DEFAULT_ROOMS_FILE;
  startServer({ port, roomsFile }).then(
    (server) => console.log(`RoomWall listening on http://localhost:${server.address().port} (rooms: ${roomsFile})`),
    (error) => {
      console.error(`RoomWall failed to start: ${error.message}`);
      process.exitCode = 1;
    },
  );
}

module.exports = { startServer };
