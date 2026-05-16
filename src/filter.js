/**
 * filter.js — Filter environment variables by key patterns, value types, or custom predicates
 */

/**
 * Filter env entries by a key glob/regex pattern
 * @param {Object} env
 * @param {string|RegExp} pattern
 * @returns {Object}
 */
function filterByPattern(env, pattern) {
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => regex.test(key))
  );
}

/**
 * Filter env entries where value matches a predicate
 * @param {Object} env
 * @param {Function} predicate
 * @returns {Object}
 */
function filterByValue(env, predicate) {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  return Object.fromEntries(
    Object.entries(env).filter(([, value]) => predicate(value))
  );
}

/**
 * Filter env entries to only those with non-empty values
 * @param {Object} env
 * @returns {Object}
 */
function filterNonEmpty(env) {
  return Object.fromEntries(
    Object.entries(env).filter(([, value]) => value !== '' && value != null)
  );
}

/**
 * Filter env entries by a list of allowed keys
 * @param {Object} env
 * @param {string[]} keys
 * @returns {Object}
 */
function filterByKeys(env, keys) {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => keySet.has(key))
  );
}

/**
 * Exclude keys from env
 * @param {Object} env
 * @param {string[]} keys
 * @returns {Object}
 */
function excludeKeys(env, keys) {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => !keySet.has(key))
  );
}

/**
 * Summarize the result of filtering
 * @param {Object} original
 * @param {Object} filtered
 * @returns {Object}
 */
function summarizeFilter(original, filtered) {
  const originalKeys = Object.keys(original);
  const filteredKeys = Object.keys(filtered);
  const removed = originalKeys.filter(k => !filteredKeys.includes(k));
  return {
    total: originalKeys.length,
    kept: filteredKeys.length,
    removed: removed.length,
    removedKeys: removed,
  };
}

module.exports = {
  filterByPattern,
  filterByValue,
  filterNonEmpty,
  filterByKeys,
  excludeKeys,
  summarizeFilter,
};
