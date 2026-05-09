/**
 * flattener.js — Flatten nested objects into env-compatible key=value pairs
 * and expand flat env maps back into nested objects.
 */

/**
 * Flatten a nested object into dot-notation env keys.
 * @param {object} obj
 * @param {string} prefix
 * @param {string} separator
 * @returns {object}
 */
function flattenObject(obj, prefix = '', separator = '__') {
  if (typeof obj !== 'object' || obj === null) {
    throw new TypeError('flattenObject expects a non-null object');
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}${separator}${key.toUpperCase()}` : key.toUpperCase();
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, fullKey, separator));
    } else {
      acc[fullKey] = Array.isArray(value) ? JSON.stringify(value) : String(value);
    }
    return acc;
  }, {});
}

/**
 * Expand a flat env map (dot/underscore-separated keys) into a nested object.
 * @param {object} env
 * @param {string} separator
 * @returns {object}
 */
function expandEnv(env, separator = '__') {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('expandEnv expects a non-null object');
  }

  const result = {};

  for (const [key, value] of Object.entries(env)) {
    const parts = key.split(separator).map(p => p.toLowerCase());
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * Flatten an env map — alias for flattenObject with a plain env dict.
 * @param {object} env
 * @param {string} separator
 * @returns {object}
 */
function flattenEnv(env, separator = '__') {
  return flattenObject(env, '', separator);
}

module.exports = { flattenObject, expandEnv, flattenEnv };
