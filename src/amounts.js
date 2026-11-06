const { MIN_GROUPED_AMOUNT, SUFFIX_EXPONENTS } = require('./config');

const AMOUNT = /(?<![\w.,])(₦|NGN|ngn|USD|usd|N|\$|£|€)?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?([kKmMbB])?(?![\w]|[.,]\d)/g;

function canonicalValue(integerPart, fractionPart, exponent) {
  const digits = integerPart + fractionPart;
  const shift = exponent - fractionPart.length;
  const whole = shift >= 0 ? digits + '0'.repeat(shift) : digits.slice(0, digits.length + shift);
  const fraction = shift >= 0 ? '' : digits.slice(digits.length + shift).replace(/0+$/, '');
  const integer = whole.replace(/^0+/, '') || '0';
  return fraction ? `${integer}.${fraction}` : integer;
}

function hasMoneySignal(currency, suffix, grouped, value) {
  if (currency || suffix) return true;
  return grouped && BigInt(value.split('.')[0]) >= MIN_GROUPED_AMOUNT;
}

function detectAmounts(text) {
  const amounts = [];
  for (const match of text.matchAll(AMOUNT)) {
    const [, currency, rawInteger, fraction = '', suffix] = match;
    const integerPart = rawInteger.replace(/,/g, '');
    const exponent = suffix ? SUFFIX_EXPONENTS[suffix.toLowerCase()] : 0;
    const value = canonicalValue(integerPart, fraction, exponent);
    if (hasMoneySignal(currency, suffix, rawInteger.includes(','), value)) amounts.push(value);
  }
  return amounts;
}

module.exports = { detectAmounts, canonicalValue };
