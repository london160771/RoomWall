const test = require('node:test');
const assert = require('node:assert/strict');
const { detectItems } = require('../src/detectors');

const keysOf = (content) => detectItems(content).filter((entry) => entry.kind !== 'shingle').map((entry) => entry.key);

test('markdown formatting is stripped before detection', () => {
  assert.deepEqual(keysOf('Send to **Finance@Acme.ng** for `₦4,500,000`'), ['amount:4500000', 'email:finance@acme.ng']);
  assert.deepEqual(keysOf('[write us](mailto:finance@acme.ng)'), ['email:finance@acme.ng']);
});

test('repeated items are reported once', () => {
  assert.deepEqual(keysOf('4.5m or ₦4,500,000 or N4.5m'), ['amount:4500000']);
});

test('shingles are recordable only in #private messages', () => {
  const plain = detectItems('one two three four five six seven eight nine');
  const tagged = detectItems('#private one two three four five six seven eight nine');
  assert.ok(plain.length > 0 && plain.every((entry) => !entry.recordable));
  assert.ok(tagged.length > 0 && tagged.every((entry) => entry.recordable));
});

test('a message with nothing sensitive has no recordable items', () => {
  assert.deepEqual(detectItems('Happy to help plan your next sprint.').filter((entry) => entry.recordable), []);
});
