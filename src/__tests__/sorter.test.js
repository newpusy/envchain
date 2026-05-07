const { sortEnv, groupByPrefix, sortEnvBy, filterByPrefix } = require('../sorter');

const sampleEnv = {
  DB_HOST: 'localhost',
  APP_NAME: 'envchain',
  AWS_REGION: 'us-east-1',
  DB_PORT: '5432',
  APP_ENV: 'test',
  STANDALONE: 'yes',
};

describe('sortEnv', () => {
  it('sorts keys alphabetically', () => {
    const result = sortEnv(sampleEnv);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort());
  });

  it('preserves all key-value pairs', () => {
    const result = sortEnv(sampleEnv);
    expect(Object.keys(result).length).toBe(Object.keys(sampleEnv).length);
    for (const [key, value] of Object.entries(sampleEnv)) {
      expect(result[key]).toBe(value);
    }
  });

  it('returns empty object for empty input', () => {
    expect(sortEnv({})).toEqual({});
  });
});

describe('groupByPrefix', () => {
  it('groups keys by prefix', () => {
    const result = groupByPrefix(sampleEnv);
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result['APP']).toEqual({ APP_NAME: 'envchain', APP_ENV: 'test' });
    expect(result['AWS']).toEqual({ AWS_REGION: 'us-east-1' });
  });

  it('places keys without underscore into __UNGROUPED__', () => {
    const result = groupByPrefix(sampleEnv);
    expect(result['__UNGROUPED__']).toEqual({ STANDALONE: 'yes' });
  });

  it('returns empty object for empty input', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('sortEnvBy', () => {
  it('sorts keys using a custom comparator (reverse order)', () => {
    const result = sortEnvBy(sampleEnv, (a, b) => b.localeCompare(a));
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort((a, b) => b.localeCompare(a)));
  });

  it('throws if comparator is not a function', () => {
    expect(() => sortEnvBy(sampleEnv, null)).toThrow(TypeError);
    expect(() => sortEnvBy(sampleEnv, 'asc')).toThrow('comparator must be a function');
  });
});

describe('filterByPrefix', () => {
  it('returns only keys matching the prefix', () => {
    const result = filterByPrefix(sampleEnv, 'DB_');
    expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('returns empty object if no keys match', () => {
    expect(filterByPrefix(sampleEnv, 'REDIS_')).toEqual({});
  });

  it('returns empty object for empty env', () => {
    expect(filterByPrefix({}, 'APP_')).toEqual({});
  });
});
