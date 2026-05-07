const fs = require('fs');
const path = require('path');

/**
 * Creates a snapshot of the current env state with a timestamp.
 * @param {Object} env - Key-value env object
 * @param {Object} [options={}]
 * @param {string} [options.label] - Optional label for the snapshot
 * @returns {Object} snapshot
 */
function createSnapshot(env, options = {}) {
  return {
    label: options.label || null,
    timestamp: new Date().toISOString(),
    keys: Object.keys(env),
    env: { ...env },
  };
}

/**
 * Saves a snapshot to a JSON file.
 * @param {Object} snapshot
 * @param {string} filePath
 */
function saveSnapshot(snapshot, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

/**
 * Loads a snapshot from a JSON file.
 * @param {string} filePath
 * @returns {Object} snapshot
 */
function loadSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Compares two snapshots and returns changed, added, removed keys.
 * @param {Object} snapshotA
 * @param {Object} snapshotB
 * @returns {Object} diff summary
 */
function compareSnapshots(snapshotA, snapshotB) {
  const keysA = new Set(snapshotA.keys);
  const keysB = new Set(snapshotB.keys);

  const added = [...keysB].filter(k => !keysA.has(k));
  const removed = [...keysA].filter(k => !keysB.has(k));
  const changed = [...keysB].filter(
    k => keysA.has(k) && snapshotA.env[k] !== snapshotB.env[k]
  );

  return { added, removed, changed };
}

module.exports = { createSnapshot, saveSnapshot, loadSnapshot, compareSnapshots };
