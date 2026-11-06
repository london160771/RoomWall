const test = require('node:test');
const assert = require('node:assert/strict');
const { detectAmounts, canonicalValue } = require('../src/amounts');

test('FR-DET-001: every naira form of four and a half million normalises to 4500000', () => {
  for (const text of ['₦4,500,000', '4,500,000', '4.5m', 'N4.5m', 'NGN 4.5m', '₦4.5M', 'NGN4,500,000']) {
    assert.deepEqual(detectAmounts(text), ['4500000'], text);
  }
});

test('amounts are found inside sentences and markdown-free punctuation', () => {
  assert.deepEqual(detectAmounts('Our retainer is ₦4,500,000 a month.'), ['4500000']);
  assert.deepEqual(detectAmounts('I heard acme pays N4.5m, is that right?'), ['4500000']);
  assert.deepEqual(detectAmounts('We pay 2.1m per sprint.'), ['2100000']);
  assert.deepEqual(detectAmounts('The design budget is $12,000 for this phase.'), ['12000']);
});

test('other currency markers and suffixes count as money signals', () => {
  assert.deepEqual(detectAmounts('USD 250'), ['250']);
  assert.deepEqual(detectAmounts('£300 and €40'), ['300', '40']);
  assert.deepEqual(detectAmounts('12k'), ['12000']);
  assert.deepEqual(detectAmounts('1.25b'), ['1250000000']);
});

test('normalisation uses integer digits, never floats', () => {
  assert.equal(canonicalValue('4', '5', 6), '4500000');
  assert.equal(canonicalValue('0', '1', 6), '100000');
  assert.equal(canonicalValue('4', '50', 0), '4.5');
  assert.equal(canonicalValue('1234', '5678', 3), '1234567.8');
  assert.deepEqual(detectAmounts('0.1m'), ['100000']);
});

test('INV-5: numbers without a money signal are never amounts', () => {
  for (const text of ['3 items', 'call me at 3', 'year 2026', '4500000 rows', 'version 2.1.3', 'room 101', '999', 'PIN 4.5', 'I walked 5 m']) {
    assert.deepEqual(detectAmounts(text), [], text);
  }
});

test('INV-5: comma grouping alone is a signal only for values of 1,000 or more', () => {
  assert.deepEqual(detectAmounts('1,000 users'), ['1000']);
  assert.deepEqual(detectAmounts('1,2345'), []);
});
