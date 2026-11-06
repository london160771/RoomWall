const { PHONE_MIN_DIGITS, PHONE_MAX_DIGITS, LOCAL_TRUNK_PREFIX, COUNTRY_CODE } = require('./config');

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const PHONE = /(?<![\w+])(?:\+|0)\d(?:[ -]?\d){8,14}(?!\d)/g;

function detectEmails(text) {
  return [...text.matchAll(EMAIL)].map(([email]) => email.toLowerCase());
}

function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith(LOCAL_TRUNK_PREFIX)) return COUNTRY_CODE + digits.slice(LOCAL_TRUNK_PREFIX.length);
  return digits;
}

function detectPhones(text) {
  const phones = [];
  for (const [raw] of text.matchAll(PHONE)) {
    const digitCount = raw.replace(/\D/g, '').length;
    if (digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS) phones.push(normalisePhone(raw));
  }
  return phones;
}

module.exports = { detectEmails, detectPhones };
