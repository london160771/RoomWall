const path = require('node:path');
const { startServer } = require('../src/server');
const { loadRoomDirectory } = require('../src/rooms');
const { postCheck } = require('./client');
const { renderTable } = require('./table');
const { SEEDS, CHECKS } = require('./scenario');

const ROOMS_FILE = path.join(__dirname, 'rooms.json');
const EXPECTED = { BLOCKED: 5, OK: 3 };
const OUTCOME_PREFIX = 'GUARDRAIL_RESULT_OUTCOME_';

async function runLab() {
  const rooms = loadRoomDirectory(ROOMS_FILE);
  const log = [];
  const server = await startServer({ port: 0, roomsFile: ROOMS_FILE, onCheck: (entry) => log.push(entry) });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const seed of SEEDS) {
      const response = await postCheck(baseUrl, seed);
      if (response.outcome !== `${OUTCOME_PREFIX}OK`) throw new Error(`seed ${seed.id} was not OK: ${response.outcome}`);
    }
    const rows = [];
    for (const check of CHECKS) {
      const response = await postCheck(baseUrl, check);
      const entry = log.at(-1);
      const got = response.outcome.replace(OUTCOME_PREFIX, '');
      const source = entry.result.sourceNames.join(', ') || '—';
      const expectedSource = check.source ? rooms.nameOf(check.source) : '—';
      const match = got === check.verdict && entry.result.code === check.code && source === expectedSource;
      rows.push({
        id: check.id, room: rooms.nameOf(check.roomId), role: check.role, content: check.content,
        expected: `${check.verdict} ${check.code}`, got, code: entry.result.code, source, match: match ? 'yes' : 'NO',
      });
    }
    return rows;
  } finally {
    server.close();
  }
}

function summarise(rows) {
  const blocked = rows.filter((row) => row.got === 'BLOCKED').length;
  const ok = rows.filter((row) => row.got === 'OK').length;
  const matched = rows.filter((row) => row.match === 'yes').length;
  const passed = matched === rows.length && blocked === EXPECTED.BLOCKED && ok === EXPECTED.OK;
  return { blocked, ok, matched, passed };
}

runLab().then(
  (rows) => {
    const { blocked, ok, matched, passed } = summarise(rows);
    console.log(`RoomWall Leak Lab — ${SEEDS.length} seed messages, ${rows.length} checks over HTTP\n`);
    console.log(renderTable(rows));
    console.log(`\n${blocked} BLOCKED, ${ok} OK — ${matched}/${rows.length} checks match PRD §16`);
    console.log(passed ? 'LAB PASSED' : 'LAB FAILED');
    process.exitCode = passed ? 0 : 1;
  },
  (error) => {
    console.error(`LAB ERROR: ${error.message}`);
    process.exitCode = 1;
  },
);
