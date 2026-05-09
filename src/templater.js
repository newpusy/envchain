/**
 * templater.js — Apply env vars as template variables in strings or files
 */

/**
 * Replace {{KEY}} or ${KEY} style placeholders in a template string
 * @param {string} template
 * @param {Object} env
 * @param {Object} options
 * @returns {string}
 */
function renderTemplate(template, env = {}, options = {}) {
  const { syntax = 'both', strict = false } = options;

  let result = template;

  if (syntax === 'mustache' || syntax === 'both') {
    result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      if (key in env) return env[key];
      if (strict) throw new Error(`Missing template variable: ${key}`);
      return match;
    });
  }

  if (syntax === 'shell' || syntax === 'both') {
    result = result.replace(/\$\{(\w+)\}/g, (match, key) => {
      if (key in env) return env[key];
      if (strict) throw new Error(`Missing template variable: ${key}`);
      return match;
    });
  }

  return result;
}

/**
 * Extract all placeholder keys from a template string
 * @param {string} template
 * @returns {string[]}
 */
function extractKeys(template) {
  const keys = new Set();
  const mustache = [...template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(m => m[1]);
  const shell = [...template.matchAll(/\$\{(\w+)\}/g)].map(m => m[1]);
  [...mustache, ...shell].forEach(k => keys.add(k));
  return [...keys];
}

/**
 * Render all string values in an env object as templates against itself
 * @param {Object} env
 * @param {Object} options
 * @returns {Object}
 */
function renderEnvTemplate(env = {}, options = {}) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = typeof value === 'string' ? renderTemplate(value, env, options) : value;
  }
  return result;
}

/**
 * Check which keys in an env satisfy a template's placeholders
 * @param {string} template
 * @param {Object} env
 * @returns {{ satisfied: string[], missing: string[] }}
 */
function checkTemplate(template, env = {}) {
  const keys = extractKeys(template);
  const satisfied = keys.filter(k => k in env);
  const missing = keys.filter(k => !(k in env));
  return { satisfied, missing };
}

module.exports = { renderTemplate, extractKeys, renderEnvTemplate, checkTemplate };
