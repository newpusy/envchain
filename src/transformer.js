/**
 * transformer.js
 * Provides value transformation utilities for environment variables.
 * Supports casting to common types and applying default values.
 */

const TRANSFORMERS = {
  string: (val) => String(val),
  number: (val) => {
    const n = Number(val);
    if (isNaN(n)) throw new TypeError(`Cannot cast "${val}" to number`);
    return n;
  },
  boolean: (val) => {
    if (typeof val === 'boolean') return val;
    const lower = String(val).toLowerCase();
    if (['true', '1', 'yes'].includes(lower)) return true;
    if (['false', '0', 'no'].includes(lower)) return false;
    throw new TypeError(`Cannot cast "${val}" to boolean`);
  },
  json: (val) => {
    try {
      return JSON.parse(val);
    } catch {
      throw new TypeError(`Cannot parse "${val}" as JSON`);
    }
  },
};

/**
 * Apply a schema of transformations to a flat env object.
 *
 * @param {Record<string, string>} env - Raw environment key/value pairs.
 * @param {Record<string, { type?: string, default?: any }>} schema - Transformation schema.
 * @returns {Record<string, any>} Transformed environment object.
 */
function transformEnv(env, schema = {}) {
  const result = { ...env };

  for (const [key, options] of Object.entries(schema)) {
    const { type, default: defaultValue } = options;

    if (!(key in result) || result[key] === undefined || result[key] === '') {
      if (defaultValue !== undefined) {
        result[key] = defaultValue;
        continue;
      }
    }

    if (type && key in result) {
      const transformer = TRANSFORMERS[type];
      if (!transformer) {
        throw new Error(`Unknown transformer type: "${type}"`);
      }
      result[key] = transformer(result[key]);
    }
  }

  return result;
}

module.exports = { transformEnv, TRANSFORMERS };
