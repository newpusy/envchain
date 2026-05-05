const fs = require('fs');
const path = require('path');
const { loadEnvChain } = require('./loader');

/**
 * Watches a list of .env files for changes and triggers a callback
 * with the reloaded merged environment on each change.
 *
 * @param {string[]} filePaths - Absolute or relative paths to .env files
 * @param {function} onChange - Called with the new merged env object on change
 * @param {object} [options]
 * @param {number} [options.debounceMs=300] - Debounce delay in ms
 * @returns {{ stop: function }} - Object with a stop() method to unwatch
 */
function watchEnvFiles(filePaths, onChange, options = {}) {
  const { debounceMs = 300 } = options;

  if (typeof onChange !== 'function') {
    throw new TypeError('onChange must be a function');
  }

  const resolvedPaths = filePaths.map((f) => path.resolve(f));
  const watchers = [];
  let debounceTimer = null;

  const handleChange = (eventType, filename) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const merged = await loadEnvChain(resolvedPaths);
        onChange(null, merged, { eventType, filename });
      } catch (err) {
        onChange(err, null, { eventType, filename });
      }
    }, debounceMs);
  };

  for (const filePath of resolvedPaths) {
    if (!fs.existsSync(filePath)) continue;
    const watcher = fs.watch(filePath, { persistent: false }, (eventType) => {
      handleChange(eventType, filePath);
    });
    watchers.push(watcher);
  }

  return {
    stop() {
      clearTimeout(debounceTimer);
      watchers.forEach((w) => w.close());
    },
  };
}

module.exports = { watchEnvFiles };
