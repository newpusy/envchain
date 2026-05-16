const {
  filterByPattern,
  filterByValue,
  filterNonEmpty,
  filterByKeys,
  excludeKeys,
  summarizeFilter,
} = require('../filter');

const sampleEnv = {
  APP_NAME: 'envchain',
  APP_ENV: 'test',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
  EMPTY_VAR: '',
};

describe('filterByPattern', () => {
  it('filters keys by string pattern', () => {
    const result = filterByPattern(sampleEnv, '^APP_');
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('filters keys by RegExp', () => {
    const result = filterByPattern(sampleEnv, /^DB_/);
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('returns empty object when no keys match', () => {
    const result = filterByPattern(sampleEnv, '^MISSING_');
    expect(result).toEqual({});
  });
});

describe('filterByValue', () => {
  it('filters entries by value predicate', () => {
    const result = filterByValue(sampleEnv, v => v.includes('local'));
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('throws if predicate is not a function', () => {
    expect(() => filterByValue(sampleEnv, 'not-a-fn')).toThrow(TypeError);
  });
});

describe('filterNonEmpty', () => {
  it('removes empty string values', () => {
    const result = filterNonEmpty(sampleEnv);
    expect(result).not.toHaveProperty('EMPTY_VAR');
  });

  it('keeps all non-empty entries', () => {
    const result = filterNonEmpty(sampleEnv);
    expect(Object.keys(result).length).toBe(5);
  });
});

describe('filterByKeys', () => {
  it('returns only specified keys', () => {
    const result = filterByKeys(sampleEnv, ['APP_NAME', 'DB_HOST']);
    expect(result).toEqual({ APP_NAME: 'envchain', DB_HOST: 'localhost' });
  });

  it('ignores keys not present in env', () => {
    const result = filterByKeys(sampleEnv, ['APP_NAME', 'NOT_REAL']);
    expect(result).toEqual({ APP_NAME: 'envchain' });
  });
});

describe('excludeKeys', () => {
  it('removes specified keys from env', () => {
    const result = excludeKeys(sampleEnv, ['SECRET_KEY', 'EMPTY_VAR']);
    expect(result).not.toHaveProperty('SECRET_KEY');
    expect(result).not.toHaveProperty('EMPTY_VAR');
    expect(Object.keys(result).length).toBe(4);
  });
});

describe('summarizeFilter', () => {
  it('returns correct summary counts', () => {
    const filtered = filterNonEmpty(sampleEnv);
    const summary = summarizeFilter(sampleEnv, filtered);
    expect(summary.total).toBe(6);
    expect(summary.kept).toBe(5);
    expect(summary.removed).toBe(1);
    expect(summary.removedKeys).toContain('EMPTY_VAR');
  });
});
