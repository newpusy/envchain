/**
 * sanitizer.js
 * Sanitize environment variable keys and values
 */

const VALID_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Sanitize an env key: trim whitespace, uppercase, validate format
 * @param {string} key
 * @returns {string}
 */
function sanitizeKey(key) {
  if (typeof key !== 'string') {
    throw new TypeError(`Env key must be a string, got ${typeof key}`);
  }

  const trimmed = key.trim().toUpperCase();

  if (trimmed.length === 0) {
    throw new Error('Env key cannot be empty');
  }

  if (!VALID_KEY_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid env key "${trimmed}": must start with a letter or underscore and contain only alphanumeric characters or underscores`
    );
  }

  return trimmed;
}

/**
 * Sanitize an env value: trim surrounding whitespace, remove null bytes
 * @param {string} value
 * @returns {string}
 */
function sanitizeValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    value = String(value);
  }

  // Remove null bytes
  return value.replace(/\0/g, '').trim();
}

/**
 * Sanitize an entire env object
 * @param {Record<string, string>} env
 * @param {{ strict?: boolean }} options
 * @returns {Record<string, string>}
 */
function sanitizeEnv(env, { strict = false } = {}) {
  const result = {};

  for (const [rawKey, rawValue] of Object.entries(env)) {
    try {
      const key = sanitizeKey(rawKey);
      const value = sanitizeValue(rawValue);
      result[key] = value;
    } catch (err) {
      if (strict) {
        throw err;
      }
      // skip invalid keys in non-strict mode
    }
  }

  return result;
}

module.exports = { sanitizeKey, sanitizeValue, sanitizeEnv };
