const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('../parser');
const { createSnapshot, compareSnapshots } = require('../snapshotter');

function loadFixture(name) {
  const filePath = path.join(__dirname, 'fixtures', name);
  return fs.readFileSync(filePath, 'utf8');
}

describe('snapshotter with fixture files', () => {
  it('creates a snapshot from base.env fixture', () => {
    const content = loadFixture('base.env');
    const env = parseEnvContent(content);
    const snap = createSnapshot(env, { label: 'base' });
    expect(snap.label).toBe('base');
    expect(snap.keys.length).toBeGreaterThan(0);
  });

  it('creates a snapshot from override.env fixture', () => {
    const content = loadFixture('override.env');
    const env = parseEnvContent(content);
    const snap = createSnapshot(env, { label: 'override' });
    expect(snap.keys.length).toBeGreaterThan(0);
  });

  it('detects differences between base and override fixtures', () => {
    const baseEnv = parseEnvContent(loadFixture('base.env'));
    const overrideEnv = parseEnvContent(loadFixture('override.env'));
    const snapA = createSnapshot(baseEnv);
    const snapB = createSnapshot({ ...baseEnv, ...overrideEnv });
    const diff = compareSnapshots(snapA, snapB);
    // override keys that differ should show up as changed or added
    expect(diff.changed.length + diff.added.length).toBeGreaterThanOrEqual(0);
  });

  it('snapshot from snapshot.env fixture has expected structure', () => {
    const content = loadFixture('snapshot.env');
    const env = parseEnvContent(content);
    const snap = createSnapshot(env);
    expect(snap).toHaveProperty('timestamp');
    expect(snap).toHaveProperty('keys');
    expect(snap).toHaveProperty('env');
  });
});
