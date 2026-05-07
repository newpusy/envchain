const { scopeEnv, listScopes, groupByScope, unscopeEnv } = require('../scoper');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  REDIS_HOST: 'redis-host',
  REDIS_PORT: '6379',
  APP_NAME: 'envchain',
  PORT: '3000',
};

describe('scopeEnv', () => {
  it('returns only keys matching the scope prefix', () => {
    const result = scopeEnv(sampleEnv, 'DB');
    expect(Object.keys(result)).toEqual(['HOST', 'PORT', 'NAME']);
  });

  it('strips prefix by default', () => {
    const result = scopeEnv(sampleEnv, 'DB');
    expect(result).toEqual({ HOST: 'localhost', PORT: '5432', NAME: 'mydb' });
  });

  it('keeps prefix when stripPrefix is false', () => {
    const result = scopeEnv(sampleEnv, 'DB', { stripPrefix: false });
    expect(result).toHaveProperty('DB_HOST', 'localhost');
    expect(result).not.toHaveProperty('HOST');
  });

  it('returns empty object when no keys match', () => {
    expect(scopeEnv(sampleEnv, 'KAFKA')).toEqual({});
  });

  it('throws if scope is empty', () => {
    expect(() => scopeEnv(sampleEnv, '')).toThrow('scope must be a non-empty string');
  });

  it('handles scope with trailing underscore', () => {
    const result = scopeEnv(sampleEnv, 'DB_');
    expect(result).toHaveProperty('HOST', 'localhost');
  });
});

describe('listScopes', () => {
  it('returns all unique top-level prefixes', () => {
    const scopes = listScopes(sampleEnv);
    expect(scopes).toContain('DB');
    expect(scopes).toContain('REDIS');
    expect(scopes).toContain('APP');
  });

  it('does not include unscoped keys as scopes', () => {
    const scopes = listScopes(sampleEnv);
    expect(scopes).not.toContain('PORT');
  });

  it('returns sorted list', () => {
    const scopes = listScopes(sampleEnv);
    expect(scopes).toEqual([...scopes].sort());
  });
});

describe('groupByScope', () => {
  it('groups keys under their scope', () => {
    const grouped = groupByScope(sampleEnv);
    expect(grouped.DB).toEqual({ HOST: 'localhost', PORT: '5432', NAME: 'mydb' });
    expect(grouped.REDIS).toEqual({ HOST: 'redis-host', PORT: '6379' });
  });

  it('puts unscoped keys under __root__', () => {
    const grouped = groupByScope(sampleEnv);
    expect(grouped.__root__).toEqual({ PORT: '3000' });
  });

  it('omits __root__ if no unscoped keys', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const grouped = groupByScope(env);
    expect(grouped.__root__).toBeUndefined();
  });
});

describe('unscopeEnv', () => {
  it('re-adds prefix to all keys', () => {
    const scoped = { HOST: 'localhost', PORT: '5432' };
    const result = unscopeEnv(scoped, 'DB');
    expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('handles scope with trailing underscore', () => {
    const result = unscopeEnv({ HOST: 'localhost' }, 'DB_');
    expect(result).toHaveProperty('DB_HOST', 'localhost');
  });

  it('throws if scope is empty', () => {
    expect(() => unscopeEnv({}, '')).toThrow('scope must be a non-empty string');
  });
});
