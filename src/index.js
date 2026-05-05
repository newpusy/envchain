/**
 * index.js
 * Public API for envchain.
 * Orchestrates resolving, loading, merging, transforming, and validating env files.
 */

const { resolveEnvFiles } = require('./resolver');
const { loadEnvChain } = require('./loader');
const { mergeEnvs } = require('./merger');
const { transformEnv } = require('./transformer');
const { validateEnv } = require('./validator');

/**
 * Load, merge, transform and validate environment variables from one or more .env files.
 *
 * @param {Object}   options
 * @param {string[]} [options.files]        - Explicit list of .env file paths
 * @param {string}   [options.env]          - Environment name used by resolver (e.g. 'development')
 * @param {string}   [options.baseDir]      - Base directory for resolver
 * @param {string}   [options.strategy]     - Merge strategy: 'last-wins' | 'first-wins' | 'error'
 * @param {Object}   [options.schema]       - Validation schema passed to validateEnv
 * @param {Object}   [options.transforms]   - Transform map passed to transformEnv
 * @param {boolean}  [options.applyToProcess=false] - If true, writes result into process.env
 * @returns {Object} Final merged, transformed, validated env object
 */
function envchain(options = {}) {
  const {
    files: explicitFiles,
    env,
    baseDir,
    strategy = 'last-wins',
    schema,
    transforms,
    applyToProcess = false,
  } = options;

  // 1. Resolve file paths
  const filePaths = explicitFiles ?? resolveEnvFiles({ env, baseDir });

  // 2. Load each file into its own parsed object
  const envObjects = loadEnvChain(filePaths);

  // 3. Merge all parsed objects
  let merged = mergeEnvs(envObjects, { strategy });

  // 4. Apply transforms (optional)
  if (transforms) {
    merged = transformEnv(merged, transforms);
  }

  // 5. Validate (optional)
  if (schema) {
    validateEnv(merged, schema);
  }

  // 6. Optionally propagate into process.env
  if (applyToProcess) {
    Object.assign(process.env, merged);
  }

  return merged;
}

module.exports = { envchain };
