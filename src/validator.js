/**
 * Validates that required environment variables are present and optionally
 * match a given pattern or pass a custom check function.
 *
 * @param {object} schema - Validation schema: { VAR_NAME: rule }
 *   rule can be:
 *     true          - just required
 *     RegExp        - must match pattern
 *     (val) => bool - custom validator, return true if valid
 * @param {object} env - The env map to validate against (defaults to process.env)
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateEnv(schema, env = process.env) {
  const errors = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = env[key];

    if (value === undefined || value === '') {
      errors.push(`Missing required variable: ${key}`);
      continue;
    }

    if (rule instanceof RegExp) {
      if (!rule.test(value)) {
        errors.push(`Variable ${key} does not match pattern ${rule}`);
      }
    } else if (typeof rule === 'function') {
      if (!rule(value)) {
        errors.push(`Variable ${key} failed custom validation`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateEnv };
