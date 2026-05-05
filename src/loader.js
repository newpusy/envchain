const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Loads and merges environment variables from one or more .env files.
 * Later files in the chain take precedence over earlier ones.
 *
 * @param {string[]} filePaths - Ordered list of .env file paths to load
 * @param {object} options
 * @param {boolean} options.override - Whether to override existing process.env values (default: false)
 * @returns {object} Merged key-value map of all loaded variables
 */
function loadEnvChain(filePaths, options = {}) {
  const { override = false } = options;
  const merged = {};

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      continue;
    }

    const result = dotenv.parse(fs.readFileSync(resolved));

    for (const [key, value] of Object.entries(result)) {
      merged[key] = value;

      if (override || !(key in process.env)) {
        process.env[key] = value;
      }
    }
  }

  return merged;
}

module.exports = { loadEnvChain };
