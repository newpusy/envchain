/**
 * cloner.js — Deep clone and isolate env objects with optional key filtering
 */

/**
 * Deep clone a plain env object (string values only)
 * @param {Object} env
 * @returns {Object}
 */
function cloneEnv(env) {
  if (!env || typeof env !== 'object') {
    throw new TypeError('cloneEnv: expected a plain object');
  }
  return Object.assign(Object.create(null), env);
}

/**
 * Clone only the specified keys from an env object
 * @param {Object} env
 * @param {string[]} keys
 * @returns {Object}
 */
function cloneKeys(env, keys) {
  if (!Array.isArray(keys)) {
    throw new TypeError('cloneKeys: keys must be an array');
  }
  const result = Object.create(null);
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Clone env excluding the specified keys
 * @param {Object} env
 * @param {string[]} excludeKeys
 * @returns {Object}
 */
function cloneWithout(env, excludeKeys) {
  if (!Array.isArray(excludeKeys)) {
    throw new TypeError('cloneWithout: excludeKeys must be an array');
  }
  const excluded = new Set(excludeKeys);
  const result = Object.create(null);
  for (const [key, value] of Object.entries(env)) {
    if (!excluded.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Clone and freeze the env object to prevent mutation
 * @param {Object} env
 * @returns {Readonly<Object>}
 */
function cloneImmutable(env) {
  return Object.freeze(cloneEnv(env));
}

/**
 * Summarize a cloned env
 * @param {Object} env
 * @returns {{ count: number, keys: string[] }}
 */
function cloneSummary(env) {
  const keys = Object.keys(env);
  return { count: keys.length, keys };
}

module.exports = { cloneEnv, cloneKeys, cloneWithout, cloneImmutable, cloneSummary };
