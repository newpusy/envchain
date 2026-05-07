const { tagKey, tagByPrefix, filterByTag, summarizeTags, autoTag } = require('../tagger');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  AWS_KEY: 'abc123',
  AWS_SECRET: 'secret',
  APP_NAME: 'envchain',
};

describe('tagKey', () => {
  it('adds a tag for a key', () => {
    const result = tagKey({}, 'DB_HOST', 'database');
    expect(result).toEqual({ DB_HOST: 'database' });
  });

  it('merges with existing tags', () => {
    const existing = { APP_NAME: 'app' };
    const result = tagKey(existing, 'DB_HOST', 'database');
    expect(result).toEqual({ APP_NAME: 'app', DB_HOST: 'database' });
  });

  it('throws on invalid key', () => {
    expect(() => tagKey({}, '', 'tag')).toThrow('Invalid key');
  });

  it('throws on invalid tag', () => {
    expect(() => tagKey({}, 'KEY', '')).toThrow('Invalid tag');
  });
});

describe('tagByPrefix', () => {
  it('tags all keys matching a prefix', () => {
    const result = tagByPrefix(sampleEnv, 'DB_', 'database');
    expect(result).toEqual({ DB_HOST: 'database', DB_PORT: 'database' });
  });

  it('returns empty object if no keys match', () => {
    const result = tagByPrefix(sampleEnv, 'REDIS_', 'cache');
    expect(result).toEqual({});
  });
});

describe('filterByTag', () => {
  it('returns only env vars with the given tag', () => {
    const tags = { DB_HOST: 'database', DB_PORT: 'database', APP_NAME: 'app' };
    const result = filterByTag(sampleEnv, tags, 'database');
    expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('returns empty object if no keys have the tag', () => {
    const tags = { DB_HOST: 'database' };
    const result = filterByTag(sampleEnv, tags, 'cache');
    expect(result).toEqual({});
  });
});

describe('summarizeTags', () => {
  it('counts keys per tag', () => {
    const tags = { DB_HOST: 'database', DB_PORT: 'database', APP_NAME: 'app' };
    expect(summarizeTags(tags)).toEqual({ database: 2, app: 1 });
  });

  it('returns empty object for no tags', () => {
    expect(summarizeTags({})).toEqual({});
  });
});

describe('autoTag', () => {
  it('applies multiple prefix rules', () => {
    const rules = [
      { prefix: 'DB_', tag: 'database' },
      { prefix: 'AWS_', tag: 'cloud' },
    ];
    const result = autoTag(sampleEnv, rules);
    expect(result).toEqual({
      DB_HOST: 'database',
      DB_PORT: 'database',
      AWS_KEY: 'cloud',
      AWS_SECRET: 'cloud',
    });
  });

  it('later rules overwrite earlier ones on overlap', () => {
    const rules = [
      { prefix: 'DB_', tag: 'first' },
      { prefix: 'DB_', tag: 'second' },
    ];
    const result = autoTag(sampleEnv, rules);
    expect(result.DB_HOST).toBe('second');
  });
});
