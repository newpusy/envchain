const { groupBy, groupByPrefix, groupByType, groupByKeyLength, summarizeGroups } = require('../grouper');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envchain',
  APP_ENV: 'test',
  DEBUG: 'true',
  TIMEOUT: '30',
  SECRET: '',
  X: 'short',
};

describe('groupBy', () => {
  it('groups by custom function', () => {
    const groups = groupBy(sampleEnv, (key) => key.startsWith('DB') ? 'database' : 'other');
    expect(Object.keys(groups.database)).toEqual(['DB_HOST', 'DB_PORT']);
    expect(groups.other).toBeDefined();
  });

  it('uses default group when keyFn returns falsy', () => {
    const groups = groupBy({ FOO: 'bar' }, () => null);
    expect(groups.default).toEqual({ FOO: 'bar' });
  });

  it('returns empty object for invalid input', () => {
    expect(groupBy(null, () => 'x')).toEqual({});
    expect(groupBy(undefined, () => 'x')).toEqual({});
  });
});

describe('groupByPrefix', () => {
  it('groups vars by their prefix', () => {
    const groups = groupByPrefix(sampleEnv);
    expect(groups['DB']).toHaveProperty('DB_HOST');
    expect(groups['DB']).toHaveProperty('DB_PORT');
    expect(groups['APP']).toHaveProperty('APP_NAME');
    expect(groups['APP']).toHaveProperty('APP_ENV');
  });

  it('puts keys without separator into OTHER', () => {
    const groups = groupByPrefix(sampleEnv);
    expect(groups['OTHER']).toHaveProperty('DEBUG');
    expect(groups['OTHER']).toHaveProperty('X');
  });

  it('supports custom separator', () => {
    const env = { 'NS.KEY': 'val', 'NS.OTHER': 'v2', PLAIN: 'x' };
    const groups = groupByPrefix(env, '.');
    expect(groups['NS']).toHaveProperty('NS.KEY');
  });
});

describe('groupByType', () => {
  it('groups booleans correctly', () => {
    const groups = groupByType(sampleEnv);
    expect(groups.boolean).toHaveProperty('DEBUG');
  });

  it('groups numbers correctly', () => {
    const groups = groupByType(sampleEnv);
    expect(groups.number).toHaveProperty('DB_PORT');
    expect(groups.number).toHaveProperty('TIMEOUT');
  });

  it('groups empty values', () => {
    const groups = groupByType(sampleEnv);
    expect(groups.empty).toHaveProperty('SECRET');
  });

  it('groups strings correctly', () => {
    const groups = groupByType(sampleEnv);
    expect(groups.string).toHaveProperty('DB_HOST');
    expect(groups.string).toHaveProperty('APP_NAME');
  });
});

describe('groupByKeyLength', () => {
  it('puts short keys in short bucket', () => {
    const groups = groupByKeyLength({ X: '1', FOO: '2' });
    expect(groups.short).toHaveProperty('X');
    expect(groups.short).toHaveProperty('FOO');
  });

  it('puts long keys in long bucket', () => {
    const groups = groupByKeyLength({ VERY_LONG_KEY_NAME: 'val' });
    expect(groups.long).toHaveProperty('VERY_LONG_KEY_NAME');
  });
});

describe('summarizeGroups', () => {
  it('returns count per group', () => {
    const groups = groupByPrefix(sampleEnv);
    const summary = summarizeGroups(groups);
    expect(summary['DB']).toBe(2);
    expect(summary['APP']).toBe(2);
  });
});
