/**
 * redactor.js — Redact sensitive environment variable values for safe logging/output
 */

const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passwd/i,
];

const DEFAULT_REDACT_VALUE = '[REDACTED]';

/**
 * Check if a key is considered sensitive based on patterns.
 * @param {string} key
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function isSensitiveKey(key, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Redact a single value if its key matches sensitive patterns.
 * @param {string} key
 * @param {string} value
 * @param {object} options
 * @returns {string}
 */
function redactValue(key, value, options = {}) {
  const {
    patterns = DEFAULT_SENSITIVE_PATTERNS,
    redactWith = DEFAULT_REDACT_VALUE,
  } = options;

  if (isSensitiveKey(key, patterns)) {
    return redactWith;
  }
  return value;
}

/**
 * Redact all sensitive values in an env object.
 * @param {object} env - key/value env map
 * @param {object} options
 * @returns {object} - new object with sensitive values redacted
 */
function redactEnv(env, options = {}) {
  if (!env || typeof env !== 'object') {
    throw new TypeError('redactEnv: env must be a non-null object');
  }

  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      redactValue(key, value, options),
    ])
  );
}

module.exports = { isSensitiveKey, redactValue, redactEnv };
