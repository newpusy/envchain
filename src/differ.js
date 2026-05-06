/**
 * differ.js — Compute diffs between two env snapshots
 */

/**
 * Compare two env objects and return added, removed, and changed keys.
 * @param {Object} previous
 * @param {Object} current
 * @returns {{ added: Object, removed: Object, changed: Object }}
 */
function diffEnvs(previous, current) {
  const added = {};
  const removed = {};
  const changed = {};

  const prevKeys = new Set(Object.keys(previous));
  const currKeys = new Set(Object.keys(current));

  for (const key of currKeys) {
    if (!prevKeys.has(key)) {
      added[key] = current[key];
    } else if (previous[key] !== current[key]) {
      changed[key] = { from: previous[key], to: current[key] };
    }
  }

  for (const key of prevKeys) {
    if (!currKeys.has(key)) {
      removed[key] = previous[key];
    }
  }

  return { added, removed, changed };
}

/**
 * Returns true if there are no differences between the two envs.
 * @param {Object} previous
 * @param {Object} current
 * @returns {boolean}
 */
function isEnvEqual(previous, current) {
  const { added, removed, changed } = diffEnvs(previous, current);
  return (
    Object.keys(added).length === 0 &&
    Object.keys(removed).length === 0 &&
    Object.keys(changed).length === 0
  );
}

/**
 * Summarize a diff result into a human-readable string.
 * @param {{ added: Object, removed: Object, changed: Object }} diff
 * @returns {string}
 */
function summarizeDiff(diff) {
  const lines = [];
  for (const key of Object.keys(diff.added)) {
    lines.push(`+ ${key}=${diff.added[key]}`);
  }
  for (const key of Object.keys(diff.removed)) {
    lines.push(`- ${key}=${diff.removed[key]}`);
  }
  for (const key of Object.keys(diff.changed)) {
    lines.push(`~ ${key}: ${diff.changed[key].from} -> ${diff.changed[key].to}`);
  }
  return lines.length > 0 ? lines.join('\n') : '(no changes)';
}

module.exports = { diffEnvs, isEnvEqual, summarizeDiff };
