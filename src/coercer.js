/**
 * coercer.js — Type coercion for environment variable values
 */

/**
 * Coerce a string value to a target type.
 * @param {string} value
 * @param {'string'|'number'|'boolean'|'json'|'array'} type
 * @returns {*}
 */
function coerceValue(value, type) {
  if (value === undefined || value === null) return value;

  switch (type) {
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new TypeError(`Cannot coerce "${value}" to number`);
      return n;
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off'].includes(lower)) return false;
      throw new TypeError(`Cannot coerce "${value}" to boolean`);
    }
    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new TypeError(`Cannot coerce "${value}" to JSON`);
      }
    }
    case 'array': {
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    case 'string':
    default:
      return String(value);
  }
}

/**
 * Coerce an env object using a schema map of { KEY: type }.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} schema
 * @returns {{ result: Record<string, *>, errors: string[] }}
 */
function coerceEnv(env, schema) {
  const result = { ...env };
  const errors = [];

  for (const [key, type] of Object.entries(schema)) {
    if (!(key in env)) continue;
    try {
      result[key] = coerceValue(env[key], type);
    } catch (err) {
      errors.push(`[${key}] ${err.message}`);
    }
  }

  return { result, errors };
}

/**
 * Infer a likely type from a string value.
 * @param {string} value
 * @returns {string}
 */
function inferType(value) {
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
  try { JSON.parse(value); return 'json'; } catch {}
  if (value.includes(',')) return 'array';
  return 'string';
}

module.exports = { coerceValue, coerceEnv, inferType };
