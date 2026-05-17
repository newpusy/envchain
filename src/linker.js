/**
 * linker.js — Link env keys across multiple env objects via reference maps
 */

/**
 * Create a link from one key to another (alias-style reference)
 * @param {string} fromKey - source key
 * @param {string} toKey - target key
 * @param {object} env - env object to read value from
 * @returns {{ from: string, to: string, value: string|undefined }}
 */
function linkKey(fromKey, toKey, env) {
  return {
    from: fromKey,
    to: toKey,
    value: env[toKey],
  };
}

/**
 * Apply a link map to an env, injecting linked values as new keys
 * @param {object} env
 * @param {object} linkMap - { NEW_KEY: 'EXISTING_KEY', ... }
 * @returns {object}
 */
function applyLinks(env, linkMap) {
  const result = { ...env };
  for (const [fromKey, toKey] of Object.entries(linkMap)) {
    if (toKey in env) {
      result[fromKey] = env[toKey];
    }
  }
  return result;
}

/**
 * Resolve a chain of linked keys until a concrete value is found
 * @param {string} key
 * @param {object} env
 * @param {number} maxDepth
 * @returns {string|undefined}
 */
function resolveLink(key, env, maxDepth = 10) {
  let current = key;
  let depth = 0;
  while (depth < maxDepth) {
    const val = env[current];
    if (val === undefined) return undefined;
    // If the value looks like a key reference (all caps, underscores, digits)
    if (/^[A-Z][A-Z0-9_]*$/.test(val) && val in env && val !== current) {
      current = val;
      depth++;
    } else {
      return val;
    }
  }
  return env[current];
}

/**
 * Summarize all links found in an env (keys whose values are other keys)
 * @param {object} env
 * @returns {Array<{ key: string, linksTo: string, resolvedValue: string|undefined }>}
 */
function summarizeLinks(env) {
  const links = [];
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && /^[A-Z][A-Z0-9_]*$/.test(value) && value in env && value !== key) {
      links.push({
        key,
        linksTo: value,
        resolvedValue: resolveLink(key, env),
      });
    }
  }
  return links;
}

module.exports = { linkKey, applyLinks, resolveLink, summarizeLinks };
