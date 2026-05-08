const { renameKey, renameKeys, mapKeys, previewRename } = require('../renamer');

describe('renameKey', () => {
  it('renames an existing key', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(renameKey(env, 'FOO', 'NEW_FOO')).toEqual({ NEW_FOO: 'bar', BAZ: 'qux' });
  });

  it('returns a copy unchanged if key does not exist', () => {
    const env = { FOO: 'bar' };
    expect(renameKey(env, 'MISSING', 'X')).toEqual({ FOO: 'bar' });
  });

  it('does not mutate the original object', () => {
    const env = { FOO: 'bar' };
    renameKey(env, 'FOO', 'NEW_FOO');
    expect(env).toEqual({ FOO: 'bar' });
  });
});

describe('renameKeys', () => {
  it('renames multiple keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = renameKeys(env, { A: 'X', B: 'Y' });
    expect(result).toEqual({ X: '1', Y: '2', C: '3' });
  });

  it('ignores rename map entries for missing keys', () => {
    const env = { A: '1' };
    const result = renameKeys(env, { MISSING: 'X' });
    expect(result).toEqual({ A: '1' });
  });

  it('handles empty rename map', () => {
    const env = { A: '1' };
    expect(renameKeys(env, {})).toEqual({ A: '1' });
  });
});

describe('mapKeys', () => {
  it('applies a transform function to all keys', () => {
    const env = { foo: '1', bar: '2' };
    const result = mapKeys(env, k => k.toUpperCase());
    expect(result).toEqual({ FOO: '1', BAR: '2' });
  });

  it('throws if transform returns empty string', () => {
    const env = { foo: '1' };
    expect(() => mapKeys(env, () => '')).toThrow();
  });

  it('throws if transform returns non-string', () => {
    const env = { foo: '1' };
    expect(() => mapKeys(env, () => 42)).toThrow();
  });
});

describe('previewRename', () => {
  it('returns preview entries with exists flag', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const preview = previewRename(env, { FOO: 'NEW_FOO', MISSING: 'X' });
    expect(preview).toEqual([
      { from: 'FOO', to: 'NEW_FOO', exists: true },
      { from: 'MISSING', to: 'X', exists: false },
    ]);
  });

  it('returns empty array for empty rename map', () => {
    expect(previewRename({ FOO: 'bar' }, {})).toEqual([]);
  });
});
