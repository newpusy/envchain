const { addPrefix, removePrefix, replacePrefix, listPrefixes } = require('../prefixer');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  SECRET: 'abc123',
};

describe('addPrefix', () => {
  it('adds a prefix to all keys', () => {
    const result = addPrefix({ HOST: 'localhost', PORT: '3000' }, 'APP_');
    expect(result).toEqual({ APP_HOST: 'localhost', APP_PORT: '3000' });
  });

  it('returns empty object for empty input', () => {
    expect(addPrefix({}, 'X_')).toEqual({});
  });

  it('throws if prefix is empty', () => {
    expect(() => addPrefix({ A: '1' }, '')).toThrow('prefix must be a non-empty string');
  });

  it('throws if prefix is not a string', () => {
    expect(() => addPrefix({ A: '1' }, 42)).toThrow('prefix must be a non-empty string');
  });
});

describe('removePrefix', () => {
  it('removes matching prefix from keys', () => {
    const result = removePrefix(sampleEnv, 'DB_');
    expect(result).toEqual({ HOST: 'localhost', PORT: '5432' });
  });

  it('skips non-prefixed keys by default', () => {
    const result = removePrefix(sampleEnv, 'DB_');
    expect(result).not.toHaveProperty('APP_NAME');
    expect(result).not.toHaveProperty('SECRET');
  });

  it('keeps non-prefixed keys when skipNonPrefixed is false', () => {
    const result = removePrefix(sampleEnv, 'DB_', { skipNonPrefixed: false });
    expect(result).toHaveProperty('APP_NAME', 'myapp');
    expect(result).toHaveProperty('SECRET', 'abc123');
  });

  it('returns empty object when no keys match', () => {
    expect(removePrefix(sampleEnv, 'NOPE_')).toEqual({});
  });

  it('throws if prefix is invalid', () => {
    expect(() => removePrefix({}, null)).toThrow('prefix must be a non-empty string');
  });
});

describe('replacePrefix', () => {
  it('replaces old prefix with new prefix', () => {
    const result = replacePrefix(sampleEnv, 'DB_', 'DATABASE_');
    expect(result).toHaveProperty('DATABASE_HOST', 'localhost');
    expect(result).toHaveProperty('DATABASE_PORT', '5432');
  });

  it('leaves non-matching keys unchanged', () => {
    const result = replacePrefix(sampleEnv, 'DB_', 'DATABASE_');
    expect(result).toHaveProperty('APP_NAME', 'myapp');
    expect(result).toHaveProperty('SECRET', 'abc123');
  });

  it('throws if oldPrefix is empty', () => {
    expect(() => replacePrefix({}, '', 'NEW_')).toThrow('oldPrefix must be a non-empty string');
  });

  it('throws if newPrefix is not a string', () => {
    expect(() => replacePrefix({}, 'OLD_', 99)).toThrow('newPrefix must be a string');
  });
});

describe('listPrefixes', () => {
  it('returns sorted list of unique prefixes', () => {
    const result = listPrefixes(sampleEnv);
    expect(result).toEqual(['APP_', 'DB_']);
  });

  it('excludes keys with no underscore', () => {
    const result = listPrefixes({ NOPREFIX: 'val', A_KEY: '1' });
    expect(result).toEqual(['A_']);
  });

  it('returns empty array for empty env', () => {
    expect(listPrefixes({})).toEqual([]);
  });

  it('deduplicates prefixes', () => {
    const env = { DB_HOST: 'a', DB_PORT: 'b', DB_NAME: 'c' };
    expect(listPrefixes(env)).toEqual(['DB_']);
  });
});
