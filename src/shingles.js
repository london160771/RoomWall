const { SHINGLE_SIZE, PRIVATE_TAG } = require('./config');

const APOSTROPHES = /['’]/g;
const NON_WORD = /[^\p{L}\p{N}]+/gu;

function isPrivate(text) {
  return text.toLowerCase().includes(PRIVATE_TAG);
}

function words(text) {
  return text
    .toLowerCase()
    .split(PRIVATE_TAG).join(' ')
    .replace(APOSTROPHES, '')
    .replace(NON_WORD, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function shingles(text) {
  const list = words(text);
  const result = [];
  for (let start = 0; start + SHINGLE_SIZE <= list.length; start += 1) {
    result.push(list.slice(start, start + SHINGLE_SIZE).join(' '));
  }
  return result;
}

module.exports = { isPrivate, shingles, words };
