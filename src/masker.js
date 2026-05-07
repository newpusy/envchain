/**
 * masker.js — Mask environment variable values for safe display/logging
 */

const DEFAULT_MASK = '***';
const DEFAULT_VISIBLE_CHARS = 4;

/**
 * Mask a single value, optionally showing the last N characters.
 * @param {string} value
 * @param {object} options
 * @returns {string}
 */
function maskValue(value, options = {}) {
  if (typeof value !== 'string' || value.length === 0) return value;

  const {
    mask = DEFAULT_MASK,
    visibleChars = DEFAULT_VISIBLE_CHARS,
    showTail = true,
  } = options;

  if (value.length <= visibleChars) return mask;

  if (showTail) {
    const tail = value.slice(-visibleChars);
    return `${mask}${tail}`;
  }

  return mask;
}

/**
 * Determine if a key should be masked based on patterns.
 * @param {string} key
 * @param {string[]} patterns
 * @returns {boolean}
 */
function shouldMask(key, patterns = []) {
  const defaultPatterns = [
    /secret/i,
    /password/i,
    /passwd/i,
    /token/i,
    /api_key/i,
    /private/i,
    /credential/i,
  ];

  const allPatterns = [
    ...defaultPatterns,
    ...patterns.map((p) => (p instanceof RegExp ? p : new RegExp(p, 'i'))),
  ];

  return allPatterns.some((re) => re.test(key));
}

/**
 * Mask all sensitive values in an env object.
 * @param {object} env
 * @param {object} options
 * @returns {object}
 */
function maskEnv(env, options = {}) {
  const { patterns = [], maskOptions = {} } = options;
  const result = {};

  for (const [key, value] of Object.entries(env)) {
    result[key] = shouldMask(key, patterns)
      ? maskValue(value, maskOptions)
      : value;
  }

  return result;
}

module.exports = { maskValue, shouldMask, maskEnv };
