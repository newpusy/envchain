/**
 * patcher.js — Apply partial patches to env objects
 */

/**
 * Apply a patch (partial update) to an env object.
 * Returns a new object with patched values.
 * @param {Object} env - Original env object
 * @param {Object} patch - Key/value pairs to apply
 * @returns {Object}
 */
function patchEnv(env, patch) {
  if (!env || typeof env !== 'object') throw new TypeError('env must be an object');
  if (!patch || typeof patch !== 'object') throw new TypeError('patch must be an object');
  return { ...env, ...patch };
}

/**
 * Apply a patch only for keys that already exist in the env.
 * New keys from patch are ignored.
 * @param {Object} env
 * @param {Object} patch
 * @returns {Object}
 */
function patchExisting(env, patch) {
  if (!env || typeof env !== 'object') throw new TypeError('env must be an object');
  if (!patch || typeof patch !== 'object') throw new TypeError('patch must be an object');
  const result = { ...env };
  for (const key of Object.keys(patch)) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      result[key] = patch[key];
    }
  }
  return result;
}

/**
 * Remove keys listed in an array from the env object.
 * @param {Object} env
 * @param {string[]} keys
 * @returns {Object}
 */
function removeKeys(env, keys) {
  if (!env || typeof env !== 'object') throw new TypeError('env must be an object');
  if (!Array.isArray(keys)) throw new TypeError('keys must be an array');
  const result = { ...env };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Summarize what a patch would change.
 * @param {Object} env
 * @param {Object} patch
 * @returns {{ added: string[], updated: string[], unchanged: string[] }}
 */
function previewPatch(env, patch) {
  if (!env || typeof env !== 'object') throw new TypeError('env must be an object');
  if (!patch || typeof patch !== 'object') throw new TypeError('patch must be an object');
  const added = [];
  const updated = [];
  const unchanged = [];
  for (const key of Object.keys(patch)) {
    if (!Object.prototype.hasOwnProperty.call(env, key)) {
      added.push(key);
    } else if (env[key] !== patch[key]) {
      updated.push(key);
    } else {
      unchanged.push(key);
    }
  }
  return { added, updated, unchanged };
}

module.exports = { patchEnv, patchExisting, removeKeys, previewPatch };
