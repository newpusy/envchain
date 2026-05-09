/**
 * freezer.js — Freeze and lock env configs to prevent accidental mutation
 */

/**
 * Deeply freeze an env object so its values cannot be modified.
 * @param {Object} env
 * @returns {Object} frozen env
 */
function freezeEnv(env) {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('freezeEnv expects a plain object');
  }
  return Object.freeze({ ...env });
}

/**
 * Check whether an env object is frozen.
 * @param {Object} env
 * @returns {boolean}
 */
function isFrozen(env) {
  return Object.isFrozen(env);
}

/**
 * Attempt to safely set a key on a (possibly frozen) env.
 * Returns a new object if frozen, mutates if not.
 * @param {Object} env
 * @param {string} key
 * @param {string} value
 * @returns {Object}
 */
function safeSet(env, key, value) {
  if (isFrozen(env)) {
    return Object.freeze({ ...env, [key]: value });
  }
  env[key] = value;
  return env;
}

/**
 * Unfreeze (thaw) a frozen env into a mutable copy.
 * @param {Object} env
 * @returns {Object} mutable copy
 */
function thawEnv(env) {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('thawEnv expects a plain object');
  }
  return { ...env };
}

/**
 * Summarize freeze status of an env object.
 * @param {Object} env
 * @returns {{ frozen: boolean, keyCount: number }}
 */
function freezeSummary(env) {
  return {
    frozen: isFrozen(env),
    keyCount: Object.keys(env).length,
  };
}

module.exports = { freezeEnv, isFrozen, safeSet, thawEnv, freezeSummary };
