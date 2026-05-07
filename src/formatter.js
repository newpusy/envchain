/**
 * formatter.js — Format env variables into various output styles
 */

/**
 * Format a single key-value pair as dotenv style
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function formatLine(key, value) {
  const needsQuotes = /\s|#|=/.test(value) || value === '';
  const formatted = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
  return `${key}=${formatted}`;
}

/**
 * Format an env object as a dotenv-style string
 * @param {Record<string, string>} env
 * @param {object} options
 * @param {boolean} [options.sorted=false]
 * @param {boolean} [options.comments=false]
 * @param {string} [options.header]
 * @returns {string}
 */
function formatEnv(env, options = {}) {
  const { sorted = false, comments = false, header } = options;

  let keys = Object.keys(env);
  if (sorted) keys = keys.sort();

  const lines = [];

  if (header) {
    lines.push(`# ${header}`);
    lines.push('');
  }

  for (const key of keys) {
    if (comments) {
      lines.push(`# ${key}`);
    }
    lines.push(formatLine(key, env[key]));
  }

  return lines.join('\n');
}

/**
 * Format env as a table string for console display
 * @param {Record<string, string>} env
 * @returns {string}
 */
function formatTable(env) {
  const keys = Object.keys(env);
  if (keys.length === 0) return '(empty)';

  const maxKeyLen = Math.max(...keys.map(k => k.length), 3);
  const separator = `${'-'.repeat(maxKeyLen + 2)}+${'-'.repeat(32)}`;

  const header = `${'KEY'.padEnd(maxKeyLen + 2)}| VALUE`;
  const rows = keys.map(k => {
    const val = String(env[k]).slice(0, 30);
    return `${k.padEnd(maxKeyLen + 2)}| ${val}`;
  });

  return [header, separator, ...rows].join('\n');
}

module.exports = { formatLine, formatEnv, formatTable };
