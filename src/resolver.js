/**
 * resolver.js
 * Resolves .env file paths based on environment and conventions.
 */

const path = require('path');
const fs = require('fs');

/**
 * Resolves an ordered list of .env file paths to load.
 * Files that don't exist are filtered out unless `strict` is true.
 *
 * @param {Object} options
 * @param {string} [options.cwd=process.cwd()] - Base directory to resolve from
 * @param {string} [options.env=process.env.NODE_ENV] - Current environment name
 * @param {string[]} [options.files] - Explicit list of file paths (overrides defaults)
 * @param {boolean} [options.strict=false] - Throw if a file is missing
 * @returns {string[]} Resolved, existing file paths in load order
 */
function resolveEnvFiles({ cwd = process.cwd(), env, files, strict = false } = {}) {
  const environment = env || process.env.NODE_ENV || 'development';

  const candidates = files
    ? files.map((f) => path.resolve(cwd, f))
    : [
        path.resolve(cwd, '.env'),
        path.resolve(cwd, `.env.${environment}`),
        path.resolve(cwd, '.env.local'),
        path.resolve(cwd, `.env.${environment}.local`),
      ];

  const resolved = [];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      resolved.push(filePath);
    } else if (strict) {
      throw new Error(`[envchain] Required env file not found: ${filePath}`);
    }
  }

  return resolved;
}

module.exports = { resolveEnvFiles };
