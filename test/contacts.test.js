const test = require('node:test');
const assert = require('node:assert/strict');
const { detectEmails, detectPhones } = require('../src/contacts');

test('FR-DET-002: emails are case-insensitive', () => {
  assert.deepEqual(detectEmails('Write to Finance@Acme.ng'), ['finance@acme.ng']);
  assert.deepEqual(detectEmails('finance@acme.ng.'), ['finance@acme.ng']);
  assert.deepEqual(detectEmails('a.b+c@mail.example.co.uk and x@y.io'), ['a.b+c@mail.example.co.uk', 'x@y.io']);
});

test('FR-DET-002: text without an address has no emails', () => {
  assert.deepEqual(detectEmails('meet @ noon, ping @wall-agent'), []);
});

test('FR-DET-003: international, compact and local forms of one phone are equal', () => {
  for (const text of ['+234 803 555 0142', '+2348035550142', '08035550142', '0803-555-0142']) {
    assert.deepEqual(detectPhones(text), ['2348035550142'], text);
  }
});

test('FR-DET-003: phones need 10 to 15 digits and a leading + or 0', () => {
  assert.deepEqual(detectPhones('+1 415 555 0100'), ['14155550100']);
  assert.deepEqual(detectPhones('0123 4567'), []);
  assert.deepEqual(detectPhones('8035550142'), []);
  assert.deepEqual(detectPhones('+1234567890123456'), []);
});

test('FR-DET-003: amounts are never phones', () => {
  assert.deepEqual(detectPhones('₦4,500,000'), []);
  assert.deepEqual(detectPhones('4,500,000 and 4500000000'), []);
});
