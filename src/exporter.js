/**
 * exporter.js
 * Export environment variables to various formats (JSON, YAML, shell script)
 */

/**
 * Export env object to JSON string
 * @param {Object} env
 * @param {boolean} pretty
 * @returns {string}
 */
function exportToJson(env, pretty = false) {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('env must be a non-null object');
  }
  return pretty ? JSON.stringify(env, null, 2) : JSON.stringify(env);
}

/**
 * Export env object to simple YAML string
 * @param {Object} env
 * @returns {string}
 */
function exportToYaml(env) {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('env must be a non-null object');
  }
  return Object.entries(env)
    .map(([key, value]) => {
      const needsQuotes = /[:#{}\[\],&*?|<>=!%@`]/.test(value) || value.includes('\n');
      return needsQuotes ? `${key}: "${value.replace(/"/g, '\\"')}"` : `${key}: ${value}`;
    })
    .join('\n');
}

/**
 * Export env object to shell export script
 * @param {Object} env
 * @returns {string}
 */
function exportToShell(env) {
  if (typeof env !== 'object' || env === null) {
    throw new TypeError('env must be a non-null object');
  }
  const lines = ['#!/bin/sh'];
  for (const [key, value] of Object.entries(env)) {
    const escaped = value.replace(/'/g, "'\\''" );
    lines.push(`export ${key}='${escaped}'`);
  }
  return lines.join('\n');
}

/**
 * Export env to a given format
 * @param {Object} env
 * @param {'json'|'yaml'|'shell'} format
 * @param {Object} options
 * @returns {string}
 */
function exportEnv(env, format = 'json', options = {}) {
  switch (format) {
    case 'json':
      return exportToJson(env, options.pretty || false);
    case 'yaml':
      return exportToYaml(env);
    case 'shell':
      return exportToShell(env);
    default:
      throw new Error(`Unsupported export format: "${format}". Use json, yaml, or shell.`);
  }
}

module.exports = { exportToJson, exportToYaml, exportToShell, exportEnv };
