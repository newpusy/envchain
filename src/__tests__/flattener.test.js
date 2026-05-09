const { flattenObject, expandEnv, flattenEnv } = require('../flattener');

describe('flattenObject', () => {
  it('flattens a shallow object', () => {
    const result = flattenObject({ db: { host: 'localhost', port: 5432 } });
    expect(result).toEqual({
      DB__HOST: 'localhost',
      DB__PORT: '5432',
    });
  });

  it('flattens deeply nested objects', () => {
    const result = flattenObject({ app: { server: { port: 3000 } } });
    expect(result).toEqual({ APP__SERVER__PORT: '3000' });
  });

  it('converts array values to JSON strings', () => {
    const result = flattenObject({ allowed: { origins: ['a.com', 'b.com'] } });
    expect(result.ALLOWED__ORIGINS).toBe('["a.com","b.com"]');
  });

  it('uses custom separator', () => {
    const result = flattenObject({ db: { host: 'localhost' } }, '', '_');
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('throws on non-object input', () => {
    expect(() => flattenObject(null)).toThrow(TypeError);
    expect(() => flattenObject('string')).toThrow(TypeError);
  });

  it('handles top-level scalar values', () => {
    const result = flattenObject({ PORT: 8080, DEBUG: true });
    expect(result).toEqual({ PORT: '8080', DEBUG: 'true' });
  });
});

describe('expandEnv', () => {
  it('expands double-underscore keys into nested objects', () => {
    const result = expandEnv({ DB__HOST: 'localhost', DB__PORT: '5432' });
    expect(result).toEqual({ db: { host: 'localhost', port: '5432' } });
  });

  it('handles deeply nested keys', () => {
    const result = expandEnv({ APP__SERVER__PORT: '3000' });
    expect(result).toEqual({ app: { server: { port: '3000' } } });
  });

  it('handles flat keys with no separator', () => {
    const result = expandEnv({ PORT: '8080' });
    expect(result).toEqual({ port: '8080' });
  });

  it('uses custom separator', () => {
    const result = expandEnv({ DB_HOST: 'localhost' }, '_');
    expect(result).toEqual({ db: { host: 'localhost' } });
  });

  it('throws on non-object input', () => {
    expect(() => expandEnv(null)).toThrow(TypeError);
  });
});

describe('flattenEnv', () => {
  it('is an alias that flattens a plain env dict', () => {
    const result = flattenEnv({ db: { host: 'localhost' } });
    expect(result).toEqual({ DB__HOST: 'localhost' });
  });

  it('round-trips with expandEnv', () => {
    const original = { db: { host: 'localhost', port: '5432' }, app: { debug: 'true' } };
    const flat = flattenEnv(original);
    const expanded = expandEnv(flat);
    expect(expanded).toEqual({
      db: { host: 'localhost', port: '5432' },
      app: { debug: 'true' },
    });
  });
});
