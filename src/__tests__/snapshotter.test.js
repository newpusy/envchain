const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  compareSnapshots,
} = require('../snapshotter');

describe('createSnapshot', () => {
  it('captures env keys and values', () => {
    const env = { APP_ENV: 'test', PORT: '3000' };
    const snap = createSnapshot(env);
    expect(snap.env).toEqual(env);
    expect(snap.keys).toEqual(['APP_ENV', 'PORT']);
    expect(snap.timestamp).toBeDefined();
    expect(snap.label).toBeNull();
  });

  it('supports optional label', () => {
    const snap = createSnapshot({ X: '1' }, { label: 'before-deploy' });
    expect(snap.label).toBe('before-deploy');
  });

  it('does not mutate original env', () => {
    const env = { A: '1' };
    const snap = createSnapshot(env);
    snap.env.A = 'changed';
    expect(env.A).toBe('1');
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  let tmpPath;

  beforeEach(() => {
    tmpPath = path.join(os.tmpdir(), `snap-${Date.now()}.json`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  });

  it('saves and reloads a snapshot', () => {
    const snap = createSnapshot({ DB: 'postgres' }, { label: 'v1' });
    saveSnapshot(snap, tmpPath);
    const loaded = loadSnapshot(tmpPath);
    expect(loaded.env).toEqual({ DB: 'postgres' });
    expect(loaded.label).toBe('v1');
  });

  it('throws if file does not exist on load', () => {
    expect(() => loadSnapshot('/nonexistent/snap.json')).toThrow('Snapshot file not found');
  });
});

describe('compareSnapshots', () => {
  it('detects added keys', () => {
    const a = createSnapshot({ A: '1' });
    const b = createSnapshot({ A: '1', B: '2' });
    const diff = compareSnapshots(a, b);
    expect(diff.added).toContain('B');
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });

  it('detects removed keys', () => {
    const a = createSnapshot({ A: '1', B: '2' });
    const b = createSnapshot({ A: '1' });
    const diff = compareSnapshots(a, b);
    expect(diff.removed).toContain('B');
  });

  it('detects changed values', () => {
    const a = createSnapshot({ PORT: '3000' });
    const b = createSnapshot({ PORT: '4000' });
    const diff = compareSnapshots(a, b);
    expect(diff.changed).toContain('PORT');
  });

  it('returns empty diff for identical snapshots', () => {
    const env = { X: 'y' };
    const diff = compareSnapshots(createSnapshot(env), createSnapshot(env));
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });
});
