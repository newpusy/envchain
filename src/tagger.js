/**
 * tagger.js — Tag and categorize environment variables with metadata labels
 */

/**
 * Assign a tag to a key
 * @param {Record<string, string>} tags - existing tag map
 * @param {string} key
 * @param {string} tag
 * @returns {Record<string, string>}
 */
function tagKey(tags, key, tag) {
  if (!key || typeof key !== 'string') throw new Error('Invalid key');
  if (!tag || typeof tag !== 'string') throw new Error('Invalid tag');
  return { ...tags, [key]: tag };
}

/**
 * Tag all keys in an env object that match a prefix with a given tag
 * @param {Record<string, string>} env
 * @param {string} prefix
 * @param {string} tag
 * @returns {Record<string, string>}
 */
function tagByPrefix(env, prefix, tag) {
  const tags = {};
  for (const key of Object.keys(env)) {
    if (key.startsWith(prefix)) {
      tags[key] = tag;
    }
  }
  return tags;
}

/**
 * Filter env variables by tag
 * @param {Record<string, string>} env
 * @param {Record<string, string>} tags
 * @param {string} tag
 * @returns {Record<string, string>}
 */
function filterByTag(env, tags, tag) {
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => tags[key] === tag)
  );
}

/**
 * Summarize tags — returns a count of keys per tag
 * @param {Record<string, string>} tags
 * @returns {Record<string, number>}
 */
function summarizeTags(tags) {
  const summary = {};
  for (const tag of Object.values(tags)) {
    summary[tag] = (summary[tag] || 0) + 1;
  }
  return summary;
}

/**
 * Apply multiple prefix->tag rules to an env object
 * @param {Record<string, string>} env
 * @param {Array<{ prefix: string, tag: string }>} rules
 * @returns {Record<string, string>}
 */
function autoTag(env, rules) {
  let tags = {};
  for (const { prefix, tag } of rules) {
    const matched = tagByPrefix(env, prefix, tag);
    tags = { ...tags, ...matched };
  }
  return tags;
}

module.exports = { tagKey, tagByPrefix, filterByTag, summarizeTags, autoTag };
