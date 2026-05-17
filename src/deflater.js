/**
 * deflater.js — Remove redundant or default-value entries from env objects
 */

/**
 * Checks if a value is considered a default/empty value.
 * @param {string} value
 * @returns {boolean}
 */
function isDefaultValue(value) {
  if (value === undefined || value === null) return true;
  const trimmed = String(value).trim();
  return trimmed === '' || trimmed === '0' || trimmed === 'false' || trimmed === 'null' || trimmed === 'undefined';
}

/**
 * Removes keys from env whose values match entries in a baseline env.
 * @param {Object} env - The env to deflate
 * @param {Object} baseline - Reference env with default values
 * @returns {Object}
 */
function deflateAgainstBaseline(env, baseline) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (Object.prototype.hasOwnProperty.call(baseline, key) && baseline[key] === value) {
      continue;
    }
    result[key] = value;
  }
  return result;
}

/**
 * Removes keys whose values are considered defaults (empty, false, 0, etc.)
 * @param {Object} env
 * @param {Object} [options]
 * @param {boolean} [options.stripEmpty=true]
 * @param {boolean} [options.stripFalsy=false]
 * @returns {Object}
 */
function deflateEnv(env, options = {}) {
  const { stripEmpty = true, stripFalsy = false } = options;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (stripFalsy && isDefaultValue(value)) continue;
    if (stripEmpty && (value === '' || value === undefined || value === null)) continue;
    result[key] = value;
  }
  return result;
}

/**
 * Summarizes what was removed during deflation.
 * @param {Object} original
 * @param {Object} deflated
 * @returns {Object}
 */
function deflateSummary(original, deflated) {
  const removedKeys = Object.keys(original).filter(k => !Object.prototype.hasOwnProperty.call(deflated, k));
  return {
    originalCount: Object.keys(original).length,
    deflatedCount: Object.keys(deflated).length,
    removedCount: removedKeys.length,
    removedKeys,
  };
}

module.exports = { isDefaultValue, deflateAgainstBaseline, deflateEnv, deflateSummary };
