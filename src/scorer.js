/**
 * scorer.js — Score env configs based on quality heuristics
 */

const SENSITIVE_PATTERN = /secret|password|token|key|auth|private/i;
const PLACEHOLDER_PATTERN = /^(todo|fixme|changeme|replace|your[-_]?.*here|xxx+|tbd)$/i;
const WEAK_VALUE_PATTERN = /^(true|false|0|1|yes|no|on|off)$/i;

/**
 * Score a single key-value pair (0–100)
 * @param {string} key
 * @param {string} value
 * @returns {{ score: number, reasons: string[] }}
 */
function scoreEntry(key, value) {
  let score = 100;
  const reasons = [];

  if (!key || key.trim() === '') {
    return { score: 0, reasons: ['empty key'] };
  }

  if (!value || value.trim() === '') {
    score -= 30;
    reasons.push('empty value');
  }

  if (PLACEHOLDER_PATTERN.test(value)) {
    score -= 40;
    reasons.push('placeholder value detected');
  }

  if (SENSITIVE_PATTERN.test(key) && value.length < 16) {
    score -= 25;
    reasons.push('sensitive key has short value');
  }

  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    score -= 10;
    reasons.push('key not in SCREAMING_SNAKE_CASE');
  }

  if (WEAK_VALUE_PATTERN.test(value) && SENSITIVE_PATTERN.test(key)) {
    score -= 20;
    reasons.push('sensitive key has weak boolean-like value');
  }

  return { score: Math.max(0, score), reasons };
}

/**
 * Score an entire env object
 * @param {Record<string, string>} env
 * @returns {{ entries: Record<string, { score: number, reasons: string[] }>, overall: number }}
 */
function scoreEnv(env) {
  const entries = {};
  let total = 0;
  const keys = Object.keys(env);

  for (const key of keys) {
    const result = scoreEntry(key, env[key]);
    entries[key] = result;
    total += result.score;
  }

  const overall = keys.length > 0 ? Math.round(total / keys.length) : 100;
  return { entries, overall };
}

/**
 * Summarize scoring results
 * @param {{ entries: Record<string, { score: number, reasons: string[] }>, overall: number }} scoreResult
 * @returns {string}
 */
function summarizeScore(scoreResult) {
  const { entries, overall } = scoreResult;
  const lines = [`Overall score: ${overall}/100`];
  for (const [key, { score, reasons }] of Object.entries(entries)) {
    if (reasons.length > 0) {
      lines.push(`  ${key} [${score}]: ${reasons.join(', ')}`);
    }
  }
  return lines.join('\n');
}

module.exports = { scoreEntry, scoreEnv, summarizeScore };
