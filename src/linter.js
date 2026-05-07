/**
 * linter.js — Lint environment variable keys and values for common issues
 */

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const SUSPICIOUS_VALUE_PATTERNS = [
  { pattern: /\s{2,}/, message: 'value contains multiple consecutive spaces' },
  { pattern: /^\s|\s$/, message: 'value has leading or trailing whitespace' },
  { pattern: /[\x00-\x08\x0B\x0C\x0E-\x1F]/, message: 'value contains control characters' },
];

/**
 * Lint a single key for naming convention issues.
 * @param {string} key
 * @returns {{ key: string, issues: string[] }}
 */
function lintKey(key) {
  const issues = [];
  if (!key || key.trim() === '') {
    issues.push('key is empty');
    return { key, issues };
  }
  if (!KEY_PATTERN.test(key)) {
    issues.push(`key "${key}" does not match recommended pattern [A-Z][A-Z0-9_]*`);
  }
  if (key.startsWith('_')) {
    issues.push(`key "${key}" starts with underscore`);
  }
  if (key.endsWith('_')) {
    issues.push(`key "${key}" ends with underscore`);
  }
  if (/__/.test(key.replace(/^_|_$/g, ''))) {
    // double underscore in middle is a warning
    if (/__/.test(key)) {
      issues.push(`key "${key}" contains double underscore`);
    }
  }
  return { key, issues };
}

/**
 * Lint a single value for common issues.
 * @param {string} key
 * @param {string} value
 * @returns {{ key: string, issues: string[] }}
 */
function lintValue(key, value) {
  const issues = [];
  if (value === undefined || value === null) {
    issues.push(`value for "${key}" is null or undefined`);
    return { key, issues };
  }
  for (const { pattern, message } of SUSPICIOUS_VALUE_PATTERNS) {
    if (pattern.test(value)) {
      issues.push(`value for "${key}": ${message}`);
    }
  }
  return { key, issues };
}

/**
 * Lint an entire env object.
 * @param {Record<string, string>} env
 * @returns {{ valid: boolean, results: Array<{ key: string, issues: string[] }> }}
 */
function lintEnv(env) {
  const results = [];
  for (const [key, value] of Object.entries(env)) {
    const keyResult = lintKey(key);
    const valueResult = lintValue(key, value);
    const issues = [...keyResult.issues, ...valueResult.issues];
    if (issues.length > 0) {
      results.push({ key, issues });
    }
  }
  const valid = results.length === 0;
  return { valid, results };
}

module.exports = { lintKey, lintValue, lintEnv };
