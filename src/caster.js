/**
 * caster.js — Cast env values to specific target types with explicit control
 */

const CAST_TYPES = ['string', 'number', 'boolean', 'json', 'array'];

/**
 * Cast a single value to the given type.
 * @param {string} value
 * @param {string} type
 * @returns {*}
 */
function castValue(value, type) {
  if (!CAST_TYPES.includes(type)) {
    throw new TypeError(`Unknown cast type: "${type}". Valid types: ${CAST_TYPES.join(', ')}`);
  }

  switch (type) {
    case 'string':
      return String(value);

    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new TypeError(`Cannot cast "${value}" to number`);
      return n;
    }

    case 'boolean': {
      const lower = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off'].includes(lower)) return false;
      throw new TypeError(`Cannot cast "${value}" to boolean`);
    }

    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new TypeError(`Cannot cast "${value}" to JSON`);
      }
    }

    case 'array':
      return value.split(',').map((v) => v.trim()).filter(Boolean);

    default:
      return value;
  }
}

/**
 * Cast multiple env keys according to a schema map.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} schema  e.g. { PORT: 'number', DEBUG: 'boolean' }
 * @returns {{ result: Record<string, *>, errors: Array<{key: string, message: string}> }}
 */
function castEnv(env, schema) {
  const result = { ...env };
  const errors = [];

  for (const [key, type] of Object.entries(schema)) {
    if (!(key in env)) continue;
    try {
      result[key] = castValue(env[key], type);
    } catch (err) {
      errors.push({ key, message: err.message });
    }
  }

  return { result, errors };
}

/**
 * Return a summary of what would be cast.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} schema
 * @returns {Array<{key: string, from: string, to: string, type: string}>}
 */
function previewCast(env, schema) {
  return Object.entries(schema)
    .filter(([key]) => key in env)
    .map(([key, type]) => ({ key, from: env[key], type }));
}

module.exports = { castValue, castEnv, previewCast, CAST_TYPES };
