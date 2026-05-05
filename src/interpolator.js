/**
 * interpolator.js
 * Handles variable interpolation within env values (e.g. ${VAR} or $VAR)
 */

/**
 * Interpolates environment variable references within a value string.
 * Supports ${VAR_NAME} and $VAR_NAME syntax.
 *
 * @param {string} value - The value string potentially containing variable references
 * @param {Object} context - The current env object to resolve references from
 * @returns {string} - The interpolated string
 */
function interpolateValue(value, context = {}) {
  if (typeof value !== 'string') return value;

  // Replace ${VAR_NAME} syntax
  let result = value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/gi, (match, varName) => {
    return Object.prototype.hasOwnProperty.call(context, varName)
      ? context[varName]
      : match;
  });

  // Replace $VAR_NAME syntax (not followed by { )
  result = result.replace(/\$([A-Z_][A-Z0-9_]*)(?!\{)/gi, (match, varName) => {
    return Object.prototype.hasOwnProperty.call(context, varName)
      ? context[varName]
      : match;
  });

  return result;
}

/**
 * Interpolates all values in an env object, resolving cross-references.
 * Processes entries in order so earlier keys can be referenced by later ones.
 *
 * @param {Object} env - Key/value env object
 * @returns {Object} - New object with all values interpolated
 */
function interpolateEnv(env = {}) {
  const result = {};

  for (const [key, value] of Object.entries(env)) {
    // Build context from already-resolved keys plus original env
    const context = { ...env, ...result };
    result[key] = interpolateValue(value, context);
  }

  return result;
}

module.exports = { interpolateValue, interpolateEnv };
