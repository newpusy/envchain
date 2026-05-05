/**
 * parser.js
 * Parses raw .env file content into key-value pairs.
 */

/**
 * Parse a single line from a .env file.
 * Supports comments, quoted values, and inline comments.
 * @param {string} line
 * @returns {{ key: string, value: string } | null}
 */
function parseLine(line) {
  const trimmed = line.trim();

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) return null;

  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return null;

  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();

  // Strip inline comments (only outside quotes)
  value = stripInlineComment(value);

  // Strip surrounding quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!key) return null;

  return { key, value };
}

/**
 * Remove inline comment from a value string.
 * @param {string} value
 * @returns {string}
 */
function stripInlineComment(value) {
  // Only strip if not inside quotes
  if (value.startsWith('"') || value.startsWith("'")) return value;
  const commentIdx = value.indexOf(' #');
  if (commentIdx !== -1) return value.slice(0, commentIdx).trim();
  return value;
}

/**
 * Parse raw .env file content into an object.
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnvContent(content) {
  const result = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      result[parsed.key] = parsed.value;
    }
  }

  return result;
}

module.exports = { parseEnvContent, parseLine };
