const test = require('node:test');
const assert = require('node:assert/strict');
const { shingles, isPrivate, words } = require('../src/shingles');

const PRIVATE = '#private codename bluebird ships with the new checkout flow on december third for every user';

test('FR-DET-004: the #private tag is detected in any case', () => {
  assert.equal(isPrivate(PRIVATE), true);
  assert.equal(isPrivate('#PRIVATE note'), true);
  assert.equal(isPrivate('a private note'), false);
});

test('FR-DET-004: words are lowercased, punctuation stripped and the tag removed', () => {
  assert.deepEqual(words('#private Hello, World! It’s DONE.'), ['hello', 'world', 'its', 'done']);
});

test('FR-DET-004: every 8-word window becomes a shingle', () => {
  const list = shingles(PRIVATE);
  assert.equal(list.length, 14 - 8 + 1);
  assert.equal(list[0], 'codename bluebird ships with the new checkout flow');
});

test('FR-DET-004: a later message with any 8 consecutive words matches regardless of case or punctuation', () => {
  const stored = new Set(shingles(PRIVATE));
  const later = 'FUN FACT: Codename, bluebird ships with the new checkout-flow on December third.';
  assert.ok(shingles(later).some((entry) => stored.has(entry)));
});

test('FR-DET-004: seven shared words are not a match', () => {
  const stored = new Set(shingles(PRIVATE));
  assert.ok(!shingles('so codename bluebird ships with the new checkout today').some((entry) => stored.has(entry)));
});

test('messages shorter than 8 words have no shingles', () => {
  assert.deepEqual(shingles('short message here'), []);
});
