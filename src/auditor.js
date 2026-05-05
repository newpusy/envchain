/**
 * auditor.js — Audit environment variable access and changes
 */

const EventEmitter = require('events');

const auditEmitter = new EventEmitter();

const LOG_LEVELS = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

/**
 * Create an audit entry
 * @param {string} event - The event type
 * @param {object} details - Details about the event
 * @param {string} level - Log level
 * @returns {object} Audit entry
 */
function createAuditEntry(event, details = {}, level = 'info') {
  return {
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS[level] || LOG_LEVELS.info,
    event,
    details,
  };
}

/**
 * Audit access to an environment variable
 * @param {string} key - The env var key
 * @param {boolean} found - Whether the key was found
 * @returns {object} Audit entry
 */
function auditAccess(key, found) {
  const entry = createAuditEntry('access', { key, found }, found ? 'info' : 'warn');
  auditEmitter.emit('audit', entry);
  return entry;
}

/**
 * Audit a change to an environment variable
 * @param {string} key - The env var key
 * @param {string} source - Source file of the change
 * @returns {object} Audit entry
 */
function auditChange(key, source) {
  const entry = createAuditEntry('change', { key, source }, 'info');
  auditEmitter.emit('audit', entry);
  return entry;
}

/**
 * Audit a validation failure
 * @param {string} key - The env var key
 * @param {string} reason - Reason for failure
 * @returns {object} Audit entry
 */
function auditValidationFailure(key, reason) {
  const entry = createAuditEntry('validation_failure', { key, reason }, 'error');
  auditEmitter.emit('audit', entry);
  return entry;
}

/**
 * Wrap an env object to audit all accesses
 * @param {object} env - The environment object
 * @returns {Proxy} Audited proxy of env
 */
function auditEnv(env) {
  return new Proxy(env, {
    get(target, key) {
      if (typeof key === 'string' && key in target) {
        auditAccess(key, true);
      } else if (typeof key === 'string' && !['then', 'toJSON'].includes(key)) {
        auditAccess(key, false);
      }
      return target[key];
    },
  });
}

module.exports = {
  auditEmitter,
  createAuditEntry,
  auditAccess,
  auditChange,
  auditValidationFailure,
  auditEnv,
};
