/**
 * deduplicator.js
 * Utilities for detecting and removing duplicate keys across merged env objects.
 */

/**
 * Find duplicate keys across multiple env objects.
 * Returns a map of key -> array of source indices where the key appears.
 */
function findDuplicates(envList) {
  const keyMap = {};

  envList.forEach((env, index) => {
    Object.keys(env).forEach((key) => {
      if (!keyMap[key]) {
        keyMap[key] = [];
      }
      keyMap[key].push(index);
    });
  });

  const duplicates = {};
  Object.entries(keyMap).forEach(([key, indices]) => {
    if (indices.length > 1) {
      duplicates[key] = indices;
    }
  });

  return duplicates;
}

/**
 * Deduplicate a single env object by keeping only the first occurrence
 * of each key (keys are already unique in a plain object, but useful
 * when working with raw parsed arrays of {key, value} pairs).
 */
function deduplicatePairs(pairs, strategy = 'first') {
  const seen = new Set();
  const result = [];

  const ordered = strategy === 'last' ? [...pairs].reverse() : pairs;

  ordered.forEach(({ key, value }) => {
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ key, value });
    }
  });

  return strategy === 'last' ? result.reverse() : result;
}

/**
 * Merge multiple env objects, flagging or resolving duplicate keys.
 * strategy: 'first' | 'last' | 'error'
 */
function deduplicateEnvs(envList, strategy = 'last') {
  const duplicates = findDuplicates(envList);

  if (strategy === 'error' && Object.keys(duplicates).length > 0) {
    const keys = Object.keys(duplicates).join(', ');
    throw new Error(`Duplicate keys found: ${keys}`);
  }

  if (strategy === 'first') {
    const result = {};
    envList.forEach((env) => {
      Object.entries(env).forEach(([key, value]) => {
        if (!(key in result)) {
          result[key] = value;
        }
      });
    });
    return result;
  }

  // default: 'last' wins
  return Object.assign({}, ...envList);
}

/**
 * Summarize duplicates found across env list.
 */
function summarizeDuplicates(envList) {
  const duplicates = findDuplicates(envList);
  const count = Object.keys(duplicates).length;
  return {
    hasDuplicates: count > 0,
    count,
    keys: Object.keys(duplicates),
    detail: duplicates,
  };
}

module.exports = { findDuplicates, deduplicatePairs, deduplicateEnvs, summarizeDuplicates };
