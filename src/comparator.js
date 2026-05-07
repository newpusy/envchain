/**
 * comparator.js
 * Compare two env objects and produce structured comparison results
 */

/**
 * Compare a single key across two env objects
 * @param {string} key
 * @param {object} envA
 * @param {object} envB
 * @returns {object}
 */
function compareKey(key, envA, envB) {
  const inA = Object.prototype.hasOwnProperty.call(envA, key);
  const inB = Object.prototype.hasOwnProperty.call(envB, key);

  if (inA && inB) {
    return {
      key,
      status: envA[key] === envB[key] ? 'equal' : 'changed',
      valueA: envA[key],
      valueB: envB[key],
    };
  }
  if (inA) {
    return { key, status: 'removed', valueA: envA[key], valueB: undefined };
  }
  return { key, status: 'added', valueA: undefined, valueB: envB[key] };
}

/**
 * Compare two env objects key by key
 * @param {object} envA
 * @param {object} envB
 * @returns {object[]}
 */
function compareEnvs(envA, envB) {
  const keys = new Set([...Object.keys(envA), ...Object.keys(envB)]);
  return Array.from(keys).sort().map((key) => compareKey(key, envA, envB));
}

/**
 * Filter comparison results by status
 * @param {object[]} results
 * @param {'equal'|'changed'|'added'|'removed'} status
 * @returns {object[]}
 */
function filterByStatus(results, status) {
  return results.filter((r) => r.status === status);
}

/**
 * Summarize comparison results
 * @param {object[]} results
 * @returns {object}
 */
function summarizeComparison(results) {
  const counts = { equal: 0, changed: 0, added: 0, removed: 0 };
  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  return { total: results.length, ...counts };
}

module.exports = { compareKey, compareEnvs, filterByStatus, summarizeComparison };
