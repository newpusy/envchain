const { loadEnvChain } = require('./loader');
const { validateEnv } = require('./validator');

/**
 * Main envchain entry point.
 * Loads a chain of .env files and optionally validates the result.
 *
 * @param {string[]} filePaths - Ordered .env file paths to load
 * @param {object} options
 * @param {object} [options.schema]   - Validation schema passed to validateEnv
 * @param {boolean} [options.override] - Override existing process.env values
 * @param {boolean} [options.strict]   - Throw on validation failure (default: false)
 * @returns {{ env: object, valid: boolean, errors: string[] }}
 */
function envchain(filePaths, options = {}) {
  const { schema, override = false, strict = false } = options;

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    throw new Error('envchain: filePaths must be a non-empty array');
  }

  const env = loadEnvChain(filePaths, { override });

  let valid = true;
  let errors = [];

  if (schema) {
    ({ valid, errors } = validateEnv(schema, env));

    if (!valid && strict) {
      throw new Error(
        `envchain validation failed:\n  ${errors.join('\n  ')}`
      );
    }
  }

  return { env, valid, errors };
}

module.exports = { envchain, loadEnvChain, validateEnv };
