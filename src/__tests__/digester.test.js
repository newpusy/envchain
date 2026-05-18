const {
  digestValue,
  digestEntry,
  digestEnv,
  digestMap,
  diffDigests,
} = require('../digester');

describe('digestValue', () => {
  it('returns a 64-char hex string', () => {
    const d = digestValue('hello');
    expect(d).toHaveLength(64);
    expect(d).toMatch(/^[a-f0-9]+$/);
  });

  it('is deterministic', () => {
    expect(digestValue('foo')).toBe(digestValue('foo'));
  });

  it('differs for different values', () => {
    expect(digestValue('foo')).not.toBe(digestValue('bar'));
  });
});

describe('digestEntry', () => {
  it('returns a 64-char hex string', () => {
    expect(digestEntry('KEY', 'val')).toHaveLength(64);
  });

  it('differs when key changes', () => {
    expect(digestEntry('A', 'val')).not.toBe(digestEntry('B', 'val'));
  });

  it('differs when value changes', () => {
    expect(digestEntry('KEY', 'v1')).not.toBe(digestEntry('KEY', 'v2'));
  });
});

describe('digestEnv', () => {
  it('returns a 64-char hex string', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(digestEnv(env)).toHaveLength(64);
  });

  it('is order-independent', () => {
    const a = { FOO: '1', BAR: '2' };
    const b = { BAR: '2', FOO: '1' };
    expect(digestEnv(a)).toBe(digestEnv(b));
  });

  it('changes when a value changes', () => {
    const a = { FOO: 'bar' };
    const b = { FOO: 'baz' };
    expect(digestEnv(a)).not.toBe(digestEnv(b));
  });

  it('handles empty env', () => {
    expect(digestEnv({})).toHaveLength(64);
  });
});

describe('digestMap', () => {
  it('returns a digest for each key', () => {
    const env = { A: '1', B: '2' };
    const map = digestMap(env);
    expect(Object.keys(map)).toEqual(expect.arrayContaining(['A', 'B']));
    expect(map.A).toHaveLength(64);
    expect(map.B).toHaveLength(64);
  });

  it('digests differ between keys with different values', () => {
    const env = { X: 'hello', Y: 'world' };
    const map = digestMap(env);
    expect(map.X).not.toBe(map.Y);
  });
});

describe('diffDigests', () => {
  it('returns empty array for identical envs', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(diffDigests(env, { ...env })).toEqual([]);
  });

  it('detects changed values', () => {
    const a = { FOO: 'old', BAR: 'same' };
    const b = { FOO: 'new', BAR: 'same' };
    expect(diffDigests(a, b)).toEqual(['FOO']);
  });

  it('detects added keys', () => {
    const a = { FOO: 'bar' };
    const b = { FOO: 'bar', NEW: 'key' };
    expect(diffDigests(a, b)).toEqual(['NEW']);
  });

  it('detects removed keys', () => {
    const a = { FOO: 'bar', OLD: 'gone' };
    const b = { FOO: 'bar' };
    expect(diffDigests(a, b)).toEqual(['OLD']);
  });

  it('returns sorted list of changed keys', () => {
    const a = { Z: '1', A: '1', M: '1' };
    const b = { Z: '2', A: '2', M: '2' };
    expect(diffDigests(a, b)).toEqual(['A', 'M', 'Z']);
  });
});
