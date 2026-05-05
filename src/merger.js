/**
 * merger.js
 * Merges multiple parsed env objects together with configurable conflict strategies.
 */

/**
 * Merge strategy options:
 * - 'last-wins'  : later sources overwrite earlier ones (default)
 * - 'first-wins' : first defined value is kept
 * - 'error'      : throw if a key is defined in more than one source
 */
const STRATEGIES = ['last-wins', 'first-wins', 'error'];

/**
 * Merges an array of env objects into a single flat object.
 *
 * @param {Object[]} envObjects - Array of parsed env key/value maps
 * @param {Object}   options
 * @param {string}   [options.strategy='last-wins'] - Conflict resolution strategy
 * @returns {Object} Merged env object
 */
function mergeEnvs(envObjects, { strategy = 'last-wins' } = {}) {
  if (!STRATEGIES.includes(strategy)) {
    throw new Error(
      `Unknown merge strategy "${strategy}". Valid options: ${STRATEGIES.join(', ')}`
    );
  }

  if (!Array.isArray(envObjects) || envObjects.length === 0) {
    return {};
  }

  const result = {};
  const seen = {}; // key -> source index where it was first set

  envObjects.forEach((envObj, sourceIndex) => {
    if (!envObj || typeof envObj !== 'object') return;

    Object.entries(envObj).forEach(([key, value]) => {
      if (key in result) {
        if (strategy === 'error') {
          throw new Error(
            `Duplicate key "${key}" found in source #${sourceIndex} ` +
            `(already defined in source #${seen[key]})`
          );
        }
        if (strategy === 'first-wins') {
          return; // keep existing value
        }
        // last-wins: fall through and overwrite
      }

      result[key] = value;
      seen[key] = sourceIndex;
    });
  });

  return result;
}

module.exports = { mergeEnvs };
