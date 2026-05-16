/**
 * indexer.js — Build searchable indexes over env key/value pairs
 */

/**
 * Build an index mapping values to their keys (reverse lookup).
 * @param {Object} env
 * @returns {Object}
 */
function buildValueIndex(env) {
  const index = {};
  for (const [key, value] of Object.entries(env)) {
    if (!index[value]) index[value] = [];
    index[value].push(key);
  }
  return index;
}

/**
 * Build a prefix index grouping keys by their prefix segments.
 * @param {Object} env
 * @param {string} separator
 * @returns {Object}
 */
function buildPrefixIndex(env, separator = '_') {
  const index = {};
  for (const key of Object.keys(env)) {
    const parts = key.split(separator);
    const prefix = parts[0];
    if (!index[prefix]) index[prefix] = [];
    index[prefix].push(key);
  }
  return index;
}

/**
 * Search keys by substring match.
 * @param {Object} env
 * @param {string} query
 * @returns {string[]}
 */
function searchKeys(env, query) {
  const q = query.toLowerCase();
  return Object.keys(env).filter(k => k.toLowerCase().includes(q));
}

/**
 * Search values by substring match, returns matching key/value pairs.
 * @param {Object} env
 * @param {string} query
 * @returns {Object}
 */
function searchValues(env, query) {
  const q = query.toLowerCase();
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (String(value).toLowerCase().includes(q)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Summarize index stats.
 * @param {Object} env
 * @returns {Object}
 */
function summarizeIndex(env) {
  const prefixIndex = buildPrefixIndex(env);
  return {
    totalKeys: Object.keys(env).length,
    uniqueValues: new Set(Object.values(env)).size,
    prefixes: Object.keys(prefixIndex).length,
    prefixBreakdown: Object.fromEntries(
      Object.entries(prefixIndex).map(([p, keys]) => [p, keys.length])
    ),
  };
}

module.exports = { buildValueIndex, buildPrefixIndex, searchKeys, searchValues, summarizeIndex };
