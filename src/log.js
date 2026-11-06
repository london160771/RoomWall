const { VERDICTS } = require('./config');

function formatCheck({ time, roomId, roomName, roles, result, elapsedMs }) {
  const source = result.verdict === VERDICTS.BLOCKED ? ` | source: ${result.sourceNames.join(', ')}` : '';
  const kinds = result.matches.length > 0 ? ` | items: ${[...new Set(result.matches.map((entry) => entry.kind))].join(', ')}` : '';
  return [
    `--- ${time.toLocaleTimeString()} POST /guardrails/check`,
    `room: ${roomName} (${roomId}) | role: ${roles.join(', ')}`,
    `verdict: ${result.verdict} | code: ${result.code}${source}${kinds} | ${elapsedMs.toFixed(1)} ms`,
  ].join('\n');
}

function consoleLogger(entry) {
  console.log(formatCheck(entry));
}

module.exports = { formatCheck, consoleLogger };
