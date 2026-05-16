/**
 * aliaser.js — Map environment variable keys to alternative names (aliases)
 */

/**
 * Create an alias for a key in an env object.
 * Returns a new env with both the original and alias key present.
 * @param {Object} env
 * @param {string} originalKey
 * @param {string} aliasKey
 * @returns {Object}
 */
function aliasKey(env, originalKey, aliasKey) {
  if (!Object.prototype.hasOwnProperty.call(env, originalKey)) {
    return { ...env };
  }
  return { ...env, [aliasKey]: env[originalKey] };
}

/**
 * Apply a map of aliases { originalKey: aliasKey } to an env object.
 * @param {Object} env
 * @param {Object} aliasMap
 * @returns {Object}
 */
function applyAliases(env, aliasMap) {
  const result = { ...env };
  for (const [original, alias] of Object.entries(aliasMap)) {
    if (Object.prototype.hasOwnProperty.call(env, original)) {
      result[alias] = env[original];
    }
  }
  return result;
}

/**
 * Remove original keys after aliasing, keeping only the alias names.
 * @param {Object} env
 * @param {Object} aliasMap
 * @returns {Object}
 */
function replaceWithAliases(env, aliasMap) {
  const result = { ...env };
  for (const [original, alias] of Object.entries(aliasMap)) {
    if (Object.prototype.hasOwnProperty.call(env, original)) {
      result[alias] = env[original];
      delete result[original];
    }
  }
  return result;
}

/**
 * List all alias mappings that are resolvable in the given env.
 * @param {Object} env
 * @param {Object} aliasMap
 * @returns {Array<{ original: string, alias: string, value: string }>}
 */
function listAliases(env, aliasMap) {
  return Object.entries(aliasMap)
    .filter(([original]) => Object.prototype.hasOwnProperty.call(env, original))
    .map(([original, alias]) => ({ original, alias, value: env[original] }));
}

module.exports = { aliasKey, applyAliases, replaceWithAliases, listAliases };
