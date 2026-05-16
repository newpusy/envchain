/**
 * tokenizer.js — Tokenize env keys into structured segments
 * Splits keys by delimiter (default: '_') and attaches metadata
 */

/**
 * Tokenize a single key into segments
 * @param {string} key
 * @param {string} delimiter
 * @returns {{ key: string, segments: string[], depth: number, prefix: string|null, base: string }}
 */
function tokenizeKey(key, delimiter = '_') {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error(`Invalid key: ${JSON.stringify(key)}`);
  }
  const segments = key.split(delimiter).filter(Boolean);
  return {
    key,
    segments,
    depth: segments.length,
    prefix: segments.length > 1 ? segments[0] : null,
    base: segments[segments.length - 1],
  };
}

/**
 * Tokenize all keys in an env object
 * @param {Record<string, string>} env
 * @param {string} delimiter
 * @returns {Array<ReturnType<tokenizeKey> & { value: string }>}
 */
function tokenizeEnv(env, delimiter = '_') {
  if (!env || typeof env !== 'object') {
    throw new Error('env must be a non-null object');
  }
  return Object.entries(env).map(([key, value]) => ({
    ...tokenizeKey(key, delimiter),
    value,
  }));
}

/**
 * Group tokenized entries by their prefix segment
 * @param {Array<ReturnType<tokenizeEnv>[number]>} tokens
 * @returns {Record<string, Array>}
 */
function groupTokensByPrefix(tokens) {
  return tokens.reduce((acc, token) => {
    const group = token.prefix || '__root__';
    if (!acc[group]) acc[group] = [];
    acc[group].push(token);
    return acc;
  }, {});
}

/**
 * Summarize tokenization results
 * @param {Array<ReturnType<tokenizeEnv>[number]>} tokens
 * @returns {{ total: number, maxDepth: number, prefixes: string[] }}
 */
function summarizeTokens(tokens) {
  const prefixes = [...new Set(tokens.map(t => t.prefix).filter(Boolean))];
  const maxDepth = tokens.reduce((max, t) => Math.max(max, t.depth), 0);
  return { total: tokens.length, maxDepth, prefixes };
}

module.exports = { tokenizeKey, tokenizeEnv, groupTokensByPrefix, summarizeTokens };
