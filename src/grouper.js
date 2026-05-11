/**
 * grouper.js — Group environment variables by various strategies
 */

/**
 * Group env vars by a custom function
 * @param {Object} env
 * @param {Function} keyFn - returns group name for a given key
 * @returns {Object} grouped env vars
 */
function groupBy(env, keyFn) {
  if (!env || typeof env !== 'object') return {};
  return Object.entries(env).reduce((groups, [key, value]) => {
    const group = keyFn(key, value) || 'default';
    if (!groups[group]) groups[group] = {};
    groups[group][key] = value;
    return groups;
  }, {});
}

/**
 * Group env vars by their prefix (e.g. DB_HOST -> 'DB')
 * @param {Object} env
 * @param {string} separator
 * @returns {Object}
 */
function groupByPrefix(env, separator = '_') {
  return groupBy(env, (key) => {
    const idx = key.indexOf(separator);
    return idx > 0 ? key.slice(0, idx) : 'OTHER';
  });
}

/**
 * Group env vars by value type (string, number, boolean, empty)
 * @param {Object} env
 * @returns {Object}
 */
function groupByType(env) {
  return groupBy(env, (_, value) => {
    if (value === '' || value == null) return 'empty';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
    return 'string';
  });
}

/**
 * Group env vars by key length bucket (short < 8, medium < 16, long >= 16)
 * @param {Object} env
 * @returns {Object}
 */
function groupByKeyLength(env) {
  return groupBy(env, (key) => {
    if (key.length < 8) return 'short';
    if (key.length < 16) return 'medium';
    return 'long';
  });
}

/**
 * Summarize grouping result
 * @param {Object} groups
 * @returns {Object}
 */
function summarizeGroups(groups) {
  return Object.entries(groups).reduce((summary, [group, vars]) => {
    summary[group] = Object.keys(vars).length;
    return summary;
  }, {});
}

module.exports = { groupBy, groupByPrefix, groupByType, groupByKeyLength, summarizeGroups };
