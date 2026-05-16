const { splitEnv, splitIntoBuckets, summarizeSplit } = require('../splitter');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envchain',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
  SECRET_TOKEN: 'xyz789',
  LOG_LEVEL: 'info',
};

describe('splitEnv', () => {
  it('splits env into matched and unmatched by predicate', () => {
    const { matched, unmatched } = splitEnv(sampleEnv, (key) => key.startsWith('DB_'));
    expect(Object.keys(matched)).toEqual(['DB_HOST', 'DB_PORT']);
    expect(matched).not.toHaveProperty('APP_NAME');
    expect(unmatched).toHaveProperty('APP_NAME');
  });

  it('returns empty matched if nothing satisfies predicate', () => {
    const { matched, unmatched } = splitEnv(sampleEnv, () => false);
    expect(Object.keys(matched)).toHaveLength(0);
    expect(Object.keys(unmatched)).toHaveLength(Object.keys(sampleEnv).length);
  });

  it('returns empty unmatched if everything satisfies predicate', () => {
    const { matched, unmatched } = splitEnv(sampleEnv, () => true);
    expect(Object.keys(matched)).toHaveLength(Object.keys(sampleEnv).length);
    expect(Object.keys(unmatched)).toHaveLength(0);
  });

  it('can split by value content', () => {
    const { matched } = splitEnv(sampleEnv, (_, v) => v.includes('localhost'));
    expect(matched).toHaveProperty('DB_HOST');
    expect(Object.keys(matched)).toHaveLength(1);
  });
});

describe('splitIntoBuckets', () => {
  const bucketDefs = {
    db: (key) => key.startsWith('DB_'),
    app: (key) => key.startsWith('APP_'),
    secrets: (key) => key.startsWith('SECRET_'),
  };

  it('assigns keys to correct buckets', () => {
    const buckets = splitIntoBuckets(sampleEnv, bucketDefs);
    expect(buckets.db).toHaveProperty('DB_HOST');
    expect(buckets.app).toHaveProperty('APP_NAME');
    expect(buckets.secrets).toHaveProperty('SECRET_KEY');
  });

  it('places unmatched keys in _rest', () => {
    const buckets = splitIntoBuckets(sampleEnv, bucketDefs);
    expect(buckets._rest).toHaveProperty('LOG_LEVEL');
  });

  it('assigns key to first matching bucket only', () => {
    const overlapping = {
      first: (key) => key.startsWith('DB'),
      second: (key) => key.startsWith('DB_HOST'),
    };
    const buckets = splitIntoBuckets({ DB_HOST: 'x' }, overlapping);
    expect(buckets.first).toHaveProperty('DB_HOST');
    expect(buckets.second).not.toHaveProperty('DB_HOST');
  });

  it('initializes all defined buckets even if empty', () => {
    const buckets = splitIntoBuckets({}, bucketDefs);
    expect(buckets).toHaveProperty('db');
    expect(buckets).toHaveProperty('app');
    expect(buckets).toHaveProperty('secrets');
    expect(buckets).toHaveProperty('_rest');
  });
});

describe('summarizeSplit', () => {
  it('returns count per bucket', () => {
    const buckets = splitIntoBuckets(sampleEnv, {
      db: (key) => key.startsWith('DB_'),
      app: (key) => key.startsWith('APP_'),
    });
    const summary = summarizeSplit(buckets);
    expect(summary.db).toBe(2);
    expect(summary.app).toBe(2);
    expect(summary._rest).toBe(3);
  });

  it('returns zero counts for empty buckets', () => {
    const summary = summarizeSplit({ a: {}, b: {} });
    expect(summary.a).toBe(0);
    expect(summary.b).toBe(0);
  });
});
