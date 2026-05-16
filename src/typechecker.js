/**
 * typechecker.js — Type-check environment variable values against a schema
 */

const TYPES = ['string', 'number', 'boolean', 'integer', 'url', 'email'];

/**
 * Check if a value matches the expected type
 * @param {string} value
 * @param {string} type
 * @returns {boolean}
 */
function checkType(value, type) {
  if (value === undefined || value === null) return false;
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value)) && value.trim() !== '';
    case 'integer':
      return Number.isInteger(Number(value)) && value.trim() !== '' && !value.includes('.');
    case 'boolean':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return false;
  }
}

/**
 * Type-check an env object against a schema map
 * @param {Record<string, string>} env
 * @param {Record<string, string>} schema — { KEY: 'type' }
 * @returns {{ valid: boolean, errors: Array<{ key: string, expected: string, value: string }> }}
 */
function typecheckEnv(env, schema) {
  const errors = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!TYPES.includes(expectedType)) {
      errors.push({ key, expected: expectedType, value: env[key], error: 'unknown type' });
      continue;
    }
    const value = env[key];
    if (!checkType(value, expectedType)) {
      errors.push({ key, expected: expectedType, value });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Summarize typecheck results
 * @param {{ valid: boolean, errors: Array }} result
 * @returns {string}
 */
function summarizeTypecheck(result) {
  if (result.valid) return 'All type checks passed.';
  const lines = result.errors.map(
    (e) => `  - ${e.key}: expected ${e.expected}, got ${JSON.stringify(e.value)}`
  );
  return `Type check failed (${result.errors.length} error(s)):\n${lines.join('\n')}`;
}

module.exports = { checkType, typecheckEnv, summarizeTypecheck, TYPES };
