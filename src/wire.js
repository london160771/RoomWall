const { POLICY, OUTCOMES, VERDICTS, CATEGORIES } = require('./config');

function finding(code) {
  return { category: CATEGORIES[code], detector_name: POLICY.detector, severity: POLICY.severity };
}

function toWireResponse(result) {
  const blocked = result.verdict === VERDICTS.BLOCKED;
  return {
    outcome: blocked ? OUTCOMES.BLOCKED : OUTCOMES.OK,
    policy_id: POLICY.id,
    policy_name: POLICY.name,
    findings: blocked ? [finding(result.code)] : [],
  };
}

module.exports = { toWireResponse };
