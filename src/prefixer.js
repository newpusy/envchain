/**
 * prefixer.js — Add, remove, or replace prefixes on environment variable keys
 */

/**
 * Add a prefix to all keys in an env object
 * @param {Object} env
 * @param {string} prefix
 * @returns {Object}
 */
function addPrefix(env, prefix) {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('prefix must be a non-empty string');
  }
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

/**
 * Remove a prefix from all matching keys in an env object
 * @param {Object} env
 * @param {string} prefix
 * @param {Object} options
 * @param {boolean} options.skipNonPrefixed - skip keys that don't have the prefix (default: true)
 * @returns {Object}
 */
function removePrefix(env, prefix, { skipNonPrefixed = true } = {}) {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('prefix must be a non-empty string');
  }
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    } else if (!skipNonPrefixed) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Replace an existing prefix with a new one
 * @param {Object} env
 * @param {string} oldPrefix
 * @param {string} newPrefix
 * @returns {Object}
 */
function replacePrefix(env, oldPrefix, newPrefix) {
  if (!oldPrefix || typeof oldPrefix !== 'string') {
    throw new Error('oldPrefix must be a non-empty string');
  }
  if (typeof newPrefix !== 'string') {
    throw new Error('newPrefix must be a string');
  }
  const unprefixed = removePrefix(env, oldPrefix, { skipNonPrefixed: false });
  // only re-prefix the ones that actually had the old prefix
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(oldPrefix)) {
      result[`${newPrefix}${key.slice(oldPrefix.length)}`] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * List all unique prefixes found in env keys (split by first underscore)
 * @param {Object} env
 * @returns {string[]}
 */
function listPrefixes(env) {
  const prefixes = new Set();
  for (const key of Object.keys(env)) {
    const idx = key.indexOf('_');
    if (idx > 0) {
      prefixes.add(key.slice(0, idx + 1));
    }
  }
  return Array.from(prefixes).sort();
}

module.exports = { addPrefix, removePrefix, replacePrefix, listPrefixes };
