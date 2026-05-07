/**
 * scoper.js — Scope environment variables by namespace prefix
 */

/**
 * Extract variables belonging to a given scope (prefix)
 * @param {Object} env - flat env object
 * @param {string} scope - prefix to scope by (e.g. 'DB')
 * @param {Object} options
 * @param {boolean} options.stripPrefix - remove the prefix from keys in result
 * @returns {Object}
 */
function scopeEnv(env, scope, { stripPrefix = true } = {}) {
  if (!scope || typeof scope !== 'string') {
    throw new Error('scope must be a non-empty string');
  }
  const prefix = scope.endsWith('_') ? scope : `${scope}_`;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const newKey = stripPrefix ? key.slice(prefix.length) : key;
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * List all unique scopes (top-level prefixes) present in an env object
 * @param {Object} env
 * @returns {string[]}
 */
function listScopes(env) {
  const scopes = new Set();
  for (const key of Object.keys(env)) {
    const parts = key.split('_');
    if (parts.length > 1) {
      scopes.add(parts[0]);
    }
  }
  return Array.from(scopes).sort();
}

/**
 * Group env variables by their top-level scope prefix
 * @param {Object} env
 * @param {boolean} stripPrefix
 * @returns {Object} - keys are scope names, values are scoped env objects
 */
function groupByScope(env, stripPrefix = true) {
  const scopes = listScopes(env);
  const result = {};
  for (const scope of scopes) {
    result[scope] = scopeEnv(env, scope, { stripPrefix });
  }
  // include unscoped keys under '__root__'
  const root = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.includes('_')) {
      root[key] = value;
    }
  }
  if (Object.keys(root).length > 0) {
    result['__root__'] = root;
  }
  return result;
}

/**
 * Merge a scoped env back into a flat env with a given prefix
 * @param {Object} scopedEnv
 * @param {string} scope
 * @returns {Object}
 */
function unscopeEnv(scopedEnv, scope) {
  if (!scope || typeof scope !== 'string') {
    throw new Error('scope must be a non-empty string');
  }
  const prefix = scope.endsWith('_') ? scope : `${scope}_`;
  const result = {};
  for (const [key, value] of Object.entries(scopedEnv)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

module.exports = { scopeEnv, listScopes, groupByScope, unscopeEnv };
