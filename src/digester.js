/**
 * digester.js — Compute checksums/digests for env variable sets
 * Useful for detecting changes, cache invalidation, and integrity checks.
 */

const crypto = require('crypto');

/**
 * Compute a SHA-256 digest for a single env value.
 * @param {string} value
 * @returns {string} hex digest
 */
function digestValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * Compute a digest for a single key=value pair.
 * @param {string} key
 * @param {string} value
 * @returns {string} hex digest
 */
function digestEntry(key, value) {
  return crypto.createHash('sha256').update(`${key}=${value}`).digest('hex');
}

/**
 * Compute a stable digest for an entire env object.
 * Keys are sorted before hashing to ensure determinism.
 * @param {Record<string, string>} env
 * @returns {string} hex digest
 */
function digestEnv(env) {
  const sorted = Object.keys(env)
    .sort()
    .map((k) => `${k}=${env[k]}`)
    .join('\n');
  return crypto.createHash('sha256').update(sorted).digest('hex');
}

/**
 * Build a per-key digest map for an env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>} map of key -> digest
 */
function digestMap(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = digestEntry(key, value);
  }
  return result;
}

/**
 * Compare two envs and return keys whose digests differ.
 * @param {Record<string, string>} envA
 * @param {Record<string, string>} envB
 * @returns {string[]} list of changed keys
 */
function diffDigests(envA, envB) {
  const mapA = digestMap(envA);
  const mapB = digestMap(envB);
  const allKeys = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  const changed = [];
  for (const key of allKeys) {
    if (mapA[key] !== mapB[key]) {
      changed.push(key);
    }
  }
  return changed.sort();
}

module.exports = { digestValue, digestEntry, digestEnv, digestMap, diffDigests };
