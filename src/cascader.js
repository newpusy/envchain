/**
 * cascader.js — Cascade env values through priority layers
 * Higher priority layers override lower ones, with traceability.
 */

/**
 * Build a cascaded env from ordered layers (lowest to highest priority).
 * Returns merged result with source tracking.
 * @param {Array<{name: string, env: object}>} layers
 * @returns {{ result: object, sources: object }}
 */
function cascadeEnvs(layers) {
  if (!Array.isArray(layers) || layers.length === 0) {
    return { result: {}, sources: {} };
  }

  const result = {};
  const sources = {};

  for (const layer of layers) {
    const { name, env } = layer;
    if (!env || typeof env !== 'object') continue;
    for (const [key, value] of Object.entries(env)) {
      result[key] = value;
      sources[key] = name;
    }
  }

  return { result, sources };
}

/**
 * Get the winning value and its source layer for a specific key.
 * @param {Array<{name: string, env: object}>} layers
 * @param {string} key
 * @returns {{ value: string|undefined, source: string|undefined }}
 */
function resolveKey(layers, key) {
  const { result, sources } = cascadeEnvs(layers);
  return {
    value: result[key],
    source: sources[key]
  };
}

/**
 * Summarize which keys were overridden and by which layers.
 * @param {Array<{name: string, env: object}>} layers
 * @returns {Array<{key: string, finalSource: string, overriddenBy: string[]}>}
 */
function summarizeCascade(layers) {
  const seen = {}; // key -> [layers that defined it]

  for (const { name, env } of layers) {
    if (!env || typeof env !== 'object') continue;
    for (const key of Object.keys(env)) {
      if (!seen[key]) seen[key] = [];
      seen[key].push(name);
    }
  }

  return Object.entries(seen).map(([key, layerNames]) => ({
    key,
    finalSource: layerNames[layerNames.length - 1],
    overriddenBy: layerNames.length > 1 ? layerNames.slice(1) : []
  }));
}

module.exports = { cascadeEnvs, resolveKey, summarizeCascade };
