/**
 * splitter.js — Split an env object into multiple named buckets by rules
 */

/**
 * Split an env object into two halves by a predicate.
 * @param {Object} env
 * @param {Function} predicate - (key, value) => boolean
 * @returns {{ matched: Object, unmatched: Object }}
 */
function splitEnv(env, predicate) {
  const matched = {};
  const unmatched = {};
  for (const [key, value] of Object.entries(env)) {
    if (predicate(key, value)) {
      matched[key] = value;
    } else {
      unmatched[key] = value;
    }
  }
  return { matched, unmatched };
}

/**
 * Split an env object into named buckets using a map of name -> predicate.
 * Keys are assigned to the first matching bucket.
 * Unmatched keys go into a special "_rest" bucket.
 * @param {Object} env
 * @param {Object} bucketDefs - { bucketName: (key, value) => boolean }
 * @returns {Object} - { bucketName: Object, ..., _rest: Object }
 */
function splitIntoBuckets(env, bucketDefs) {
  const result = { _rest: {} };
  for (const name of Object.keys(bucketDefs)) {
    result[name] = {};
  }

  for (const [key, value] of Object.entries(env)) {
    let placed = false;
    for (const [name, predicate] of Object.entries(bucketDefs)) {
      if (predicate(key, value)) {
        result[name][key] = value;
        placed = true;
        break;
      }
    }
    if (!placed) {
      result._rest[key] = value;
    }
  }

  return result;
}

/**
 * Summarize the result of splitIntoBuckets.
 * @param {Object} buckets
 * @returns {Object} - { bucketName: number }
 */
function summarizeSplit(buckets) {
  const summary = {};
  for (const [name, entries] of Object.entries(buckets)) {
    summary[name] = Object.keys(entries).length;
  }
  return summary;
}

module.exports = { splitEnv, splitIntoBuckets, summarizeSplit };
