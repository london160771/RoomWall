const { ITEM_KINDS } = require('./config');
const { stripMarkdown } = require('./text');
const { detectAmounts } = require('./amounts');
const { detectEmails, detectPhones } = require('./contacts');
const { isPrivate, shingles } = require('./shingles');

function item(kind, value, recordable) {
  return { kind, key: `${kind}:${value}`, recordable };
}

function unique(items) {
  const byKey = new Map();
  for (const entry of items) {
    const known = byKey.get(entry.key);
    byKey.set(entry.key, known && known.recordable ? known : entry);
  }
  return [...byKey.values()];
}

function detectItems(content) {
  const text = stripMarkdown(content);
  const privateMessage = isPrivate(text);
  return unique([
    ...detectAmounts(text).map((value) => item(ITEM_KINDS.AMOUNT, value, true)),
    ...detectEmails(text).map((value) => item(ITEM_KINDS.EMAIL, value, true)),
    ...detectPhones(text).map((value) => item(ITEM_KINDS.PHONE, value, true)),
    ...shingles(text).map((value) => item(ITEM_KINDS.SHINGLE, value, privateMessage)),
  ]);
}

module.exports = { detectItems };
