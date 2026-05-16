/**
 * trimmer.js — Trim whitespace and normalize spacing in env key/value pairs
 */

/**
 * Trim leading/trailing whitespace from a key.
 * Also collapses internal whitespace to a single underscore.
 * @param {string} key
 * @returns {string}
 */
function trimKey(key) {
  if (typeof key !== 'string') return key;
  return key.trim().replace(/\s+/g, '_');
}

/**
 * Trim leading/trailing whitespace from a value.
 * Preserves internal whitespace unless collapseInternal is set.
 * @param {string} value
 * @param {object} [options]
 * @param {boolean} [options.collapseInternal=false]
 * @returns {string}
 */
function trimValue(value, options = {}) {
  if (typeof value !== 'string') return value;
  const { collapseInternal = false } = options;
  const trimmed = value.trim();
  if (collapseInternal) {
    return trimmed.replace(/\s+/g, ' ');
  }
  return trimmed;
}

/**
 * Trim all keys and values in an env object.
 * @param {Record<string, string>} env
 * @param {object} [options]
 * @param {boolean} [options.collapseInternal=false] - collapse internal whitespace in values
 * @param {boolean} [options.skipEmpty=false] - drop entries that become empty after trimming
 * @returns {Record<string, string>}
 */
function trimEnv(env, options = {}) {
  const { collapseInternal = false, skipEmpty = false } = options;
  const result = {};

  for (const [rawKey, rawValue] of Object.entries(env)) {
    const key = trimKey(rawKey);
    const value = trimValue(rawValue, { collapseInternal });

    if (skipEmpty && (key === '' || value === '')) continue;

    if (key !== '') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Report which keys/values had whitespace trimmed.
 * @param {Record<string, string>} env
 * @returns {Array<{key: string, field: 'key'|'value', original: string, trimmed: string}>}
 */
function auditTrim(env) {
  const report = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    const trimmedKey = trimKey(rawKey);
    const trimmedValue = trimValue(rawValue);

    if (rawKey !== trimmedKey) {
      report.push({ key: rawKey, field: 'key', original: rawKey, trimmed: trimmedKey });
    }
    if (rawValue !== trimmedValue) {
      report.push({ key: trimmedKey, field: 'value', original: rawValue, trimmed: trimmedValue });
    }
  }

  return report;
}

module.exports = { trimKey, trimValue, trimEnv, auditTrim };
