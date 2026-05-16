const {
  buildValueIndex,
  buildPrefixIndex,
  searchKeys,
  searchValues,
  summarizeIndex,
} = require('../indexer');

const sampleEnv = {
  APP_NAME: 'myapp',
  APP_ENV: 'production',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'myapp',
  SECRET_KEY: 'abc123',
};

describe('buildValueIndex', () => {
  it('maps values to keys', () => {
    const index = buildValueIndex(sampleEnv);
    expect(index['myapp']).toEqual(expect.arrayContaining(['APP_NAME', 'DB_NAME']));
    expect(index['localhost']).toEqual(['DB_HOST']);
  });

  it('handles unique values', () => {
    const index = buildValueIndex({ A: '1', B: '2' });
    expect(index['1']).toEqual(['A']);
    expect(index['2']).toEqual(['B']);
  });
});

describe('buildPrefixIndex', () => {
  it('groups keys by prefix', () => {
    const index = buildPrefixIndex(sampleEnv);
    expect(index['APP']).toEqual(expect.arrayContaining(['APP_NAME', 'APP_ENV']));
    expect(index['DB']).toEqual(expect.arrayContaining(['DB_HOST', 'DB_PORT', 'DB_NAME']));
    expect(index['SECRET']).toEqual(['SECRET_KEY']);
  });

  it('supports custom separator', () => {
    const env = { 'APP.NAME': 'x', 'APP.ENV': 'y', 'DB.HOST': 'z' };
    const index = buildPrefixIndex(env, '.');
    expect(index['APP']).toHaveLength(2);
    expect(index['DB']).toHaveLength(1);
  });
});

describe('searchKeys', () => {
  it('finds keys by substring', () => {
    expect(searchKeys(sampleEnv, 'db')).toEqual(
      expect.arrayContaining(['DB_HOST', 'DB_PORT', 'DB_NAME'])
    );
  });

  it('is case-insensitive', () => {
    expect(searchKeys(sampleEnv, 'APP')).toEqual(
      expect.arrayContaining(['APP_NAME', 'APP_ENV'])
    );
  });

  it('returns empty array for no match', () => {
    expect(searchKeys(sampleEnv, 'zzz')).toEqual([]);
  });
});

describe('searchValues', () => {
  it('finds entries by value substring', () => {
    const result = searchValues(sampleEnv, 'local');
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('matches multiple entries', () => {
    const result = searchValues(sampleEnv, 'myapp');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('returns empty object for no match', () => {
    expect(searchValues(sampleEnv, 'nope')).toEqual({});
  });
});

describe('summarizeIndex', () => {
  it('returns correct stats', () => {
    const summary = summarizeIndex(sampleEnv);
    expect(summary.totalKeys).toBe(6);
    expect(summary.uniqueValues).toBe(5); // 'myapp' appears twice
    expect(summary.prefixes).toBe(3);
    expect(summary.prefixBreakdown['DB']).toBe(3);
  });

  it('handles empty env', () => {
    const summary = summarizeIndex({});
    expect(summary.totalKeys).toBe(0);
    expect(summary.uniqueValues).toBe(0);
    expect(summary.prefixes).toBe(0);
  });
});
