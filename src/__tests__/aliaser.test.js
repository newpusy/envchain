const { aliasKey, applyAliases, replaceWithAliases, listAliases } = require('../aliaser');

describe('aliasKey', () => {
  it('adds alias key with the same value', () => {
    const env = { DATABASE_URL: 'postgres://localhost/db' };
    const result = aliasKey(env, 'DATABASE_URL', 'DB_URL');
    expect(result.DB_URL).toBe('postgres://localhost/db');
    expect(result.DATABASE_URL).toBe('postgres://localhost/db');
  });

  it('returns copy unchanged if original key missing', () => {
    const env = { PORT: '3000' };
    const result = aliasKey(env, 'MISSING_KEY', 'ALIAS');
    expect(result).not.toHaveProperty('ALIAS');
    expect(result.PORT).toBe('3000');
  });

  it('does not mutate the original env', () => {
    const env = { API_KEY: 'secret' };
    aliasKey(env, 'API_KEY', 'KEY');
    expect(env).not.toHaveProperty('KEY');
  });
});

describe('applyAliases', () => {
  it('applies multiple aliases at once', () => {
    const env = { HOST: 'localhost', PORT: '5432' };
    const result = applyAliases(env, { HOST: 'DB_HOST', PORT: 'DB_PORT' });
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe('5432');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe('5432');
  });

  it('skips aliases for missing keys', () => {
    const env = { HOST: 'localhost' };
    const result = applyAliases(env, { HOST: 'DB_HOST', MISSING: 'OTHER' });
    expect(result).not.toHaveProperty('OTHER');
  });
});

describe('replaceWithAliases', () => {
  it('replaces original keys with alias keys', () => {
    const env = { DATABASE_URL: 'postgres://localhost/db', PORT: '3000' };
    const result = replaceWithAliases(env, { DATABASE_URL: 'DB_URL' });
    expect(result.DB_URL).toBe('postgres://localhost/db');
    expect(result).not.toHaveProperty('DATABASE_URL');
    expect(result.PORT).toBe('3000');
  });

  it('leaves env unchanged if no keys match', () => {
    const env = { FOO: 'bar' };
    const result = replaceWithAliases(env, { MISSING: 'ALIAS' });
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('listAliases', () => {
  it('lists resolvable aliases with values', () => {
    const env = { API_KEY: 'abc123', HOST: 'localhost' };
    const aliasMap = { API_KEY: 'KEY', HOST: 'SERVER_HOST', MISSING: 'NOPE' };
    const result = listAliases(env, aliasMap);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ original: 'API_KEY', alias: 'KEY', value: 'abc123' });
    expect(result).toContainEqual({ original: 'HOST', alias: 'SERVER_HOST', value: 'localhost' });
  });

  it('returns empty array when no aliases resolve', () => {
    const env = { FOO: 'bar' };
    const result = listAliases(env, { MISSING: 'ALIAS' });
    expect(result).toEqual([]);
  });
});
