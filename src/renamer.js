/**
 * renamer.js — Rename, remap, and alias environment variable keys
 */

/**
 * Rename a single key in an env object
 * @param {Object} env
 * @param {string} oldKey
 * @param {string} newKey
 * @returns {Object}
 */
function renameKey(env, oldKey, newKey) {
  if (!Object.prototype.hasOwnProperty.call(env, oldKey)) return { ...env };
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    result[k === oldKey ? newKey : k] = v;
  }
  return result;
}

/**
 * Rename multiple keys using a map of { oldKey: newKey }
 * @param {Object} env
 * @param {Object} renameMap
 * @returns {Object}
 */
function renameKeys(env, renameMap) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    const mapped = renameMap[k];
    result[mapped !== undefined ? mapped : k] = v;
  }
  return result;
}

/**
 * Apply a transform function to all keys
 * @param {Object} env
 * @param {Function} fn
 * @returns {Object}
 */
function mapKeys(env, fn) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    const newKey = fn(k);
    if (typeof newKey !== 'string' || newKey.trim() === '') {
      throw new Error(`Key transform produced invalid key for: ${k}`);
    }
    result[newKey] = v;
  }
  return result;
}

/**
 * Summarize what renames would be applied without modifying the object
 * @param {Object} env
 * @param {Object} renameMap
 * @returns {Array<{from: string, to: string, exists: boolean}>}
 */
function previewRename(env, renameMap) {
  return Object.entries(renameMap).map(([from, to]) => ({
    from,
    to,
    exists: Object.prototype.hasOwnProperty.call(env, from),
  }));
}

module.exports = { renameKey, renameKeys, mapKeys, previewRename };
