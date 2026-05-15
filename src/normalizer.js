/**
 * normalizer.js
 * Normalize environment variable keys and values to consistent formats.
 * Handles case normalization, whitespace trimming, and value standardization.
 */

/**
 * Normalize a key to a standard format (uppercase, underscores, no leading/trailing whitespace).
 * @param {string} key - The environment variable key.
 * @param {object} [options]
 * @param {boolean} [options.uppercase=true] - Convert key to uppercase.
 * @param {boolean} [options.snakeCase=true] - Convert hyphens/spaces to underscores.
 * @returns {string} Normalized key.
 */
function normalizeKey(key, options = {}) {
  const { uppercase = true, snakeCase = true } = options;

  if (typeof key !== 'string') return '';

  let normalized = key.trim();

  if (snakeCase) {
    normalized = normalized.replace(/[-\s]+/g, '_');
  }

  if (uppercase) {
    normalized = normalized.toUpperCase();
  }

  // Remove any characters that aren't alphanumeric or underscore
  normalized = normalized.replace(/[^A-Z0-9_]/gi, '');

  return normalized;
}

/**
 * Normalize a value by trimming whitespace and standardizing boolean/null representations.
 * @param {string} value - The environment variable value.
 * @param {object} [options]
 * @param {boolean} [options.trimWhitespace=true] - Trim surrounding whitespace.
 * @param {boolean} [options.normalizeBooleans=true] - Normalize true/false/yes/no/1/0 to 'true'/'false'.
 * @param {boolean} [options.normalizeEmpty=true] - Convert whitespace-only values to empty string.
 * @returns {string} Normalized value.
 */
function normalizeValue(value, options = {}) {
  const {
    trimWhitespace = true,
    normalizeBooleans = true,
    normalizeEmpty = true,
  } = options;

  if (typeof value !== 'string') return String(value ?? '');

  let normalized = trimWhitespace ? value.trim() : value;

  if (normalizeEmpty && normalized.trim() === '') {
    return '';
  }

  if (normalizeBooleans) {
    const lower = normalized.toLowerCase();
    if (['true', 'yes', '1'].includes(lower)) return 'true';
    if (['false', 'no', '0'].includes(lower)) return 'false';
  }

  return normalized;
}

/**
 * Normalize an entire env object — keys and values.
 * @param {object} env - Key/value pairs of environment variables.
 * @param {object} [options] - Options passed to normalizeKey and normalizeValue.
 * @returns {{ env: object, changes: Array<{key: string, originalKey: string, originalValue: string, normalizedKey: string, normalizedValue: string}> }}
 */
function normalizeEnv(env, options = {}) {
  if (!env || typeof env !== 'object') return { env: {}, changes: [] };

  const result = {};
  const changes = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    const normalizedKey = normalizeKey(rawKey, options);
    const normalizedValue = normalizeValue(String(rawValue ?? ''), options);

    const keyChanged = normalizedKey !== rawKey;
    const valueChanged = normalizedValue !== String(rawValue ?? '');

    if (keyChanged || valueChanged) {
      changes.push({
        originalKey: rawKey,
        originalValue: String(rawValue ?? ''),
        normalizedKey,
        normalizedValue,
      });
    }

    // Last writer wins if two keys normalize to the same name
    result[normalizedKey] = normalizedValue;
  }

  return { env: result, changes };
}

module.exports = { normalizeKey, normalizeValue, normalizeEnv };
