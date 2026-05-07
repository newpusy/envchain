/**
 * sorter.js — Sort and group environment variables by key patterns or prefixes
 */

/**
 * Sort env keys alphabetically
 * @param {Object} env
 * @returns {Object}
 */
function sortEnv(env) {
  const sorted = {};
  Object.keys(env)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key) => {
      sorted[key] = env[key];
    });
  return sorted;
}

/**
 * Group env variables by prefix (e.g. DB_, AWS_, APP_)
 * @param {Object} env
 * @returns {Object} map of prefix => { key: value }
 */
function groupByPrefix(env) {
  const groups = {};
  for (const [key, value] of Object.entries(env)) {
    const underscoreIdx = key.indexOf('_');
    const prefix = underscoreIdx !== -1 ? key.slice(0, underscoreIdx) : '__UNGROUPED__';
    if (!groups[prefix]) {
      groups[prefix] = {};
    }
    groups[prefix][key] = value;
  }
  return groups;
}

/**
 * Sort env variables by a custom comparator
 * @param {Object} env
 * @param {Function} comparator - (a: string, b: string) => number
 * @returns {Object}
 */
function sortEnvBy(env, comparator) {
  if (typeof comparator !== 'function') {
    throw new TypeError('comparator must be a function');
  }
  const sorted = {};
  Object.keys(env)
    .sort(comparator)
    .forEach((key) => {
      sorted[key] = env[key];
    });
  return sorted;
}

/**
 * Filter env keys matching a given prefix
 * @param {Object} env
 * @param {string} prefix
 * @returns {Object}
 */
function filterByPrefix(env, prefix) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { sortEnv, groupByPrefix, sortEnvBy, filterByPrefix };
