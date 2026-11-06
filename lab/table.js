const COLUMNS = ['#', 'Room', 'Role', 'Content', 'Expected', 'Got', 'Code', 'Source', 'Match'];
const CONTENT_WIDTH = 44;

function clip(text) {
  return text.length > CONTENT_WIDTH ? `${text.slice(0, CONTENT_WIDTH - 1)}…` : text;
}

function renderTable(rows) {
  const cells = rows.map((row) => [row.id, row.room, row.role, clip(row.content), row.expected, row.got, row.code, row.source, row.match]);
  const widths = COLUMNS.map((title, index) => Math.max(title.length, ...cells.map((line) => line[index].length)));
  const format = (line) => line.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd();
  return [format(COLUMNS), widths.map((width) => '-'.repeat(width)).join('  '), ...cells.map(format)].join('\n');
}

module.exports = { renderTable };
