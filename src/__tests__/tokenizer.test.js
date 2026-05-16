const {
  tokenizeKey,
  tokenizeEnv,
  groupTokensByPrefix,
  summarizeTokens,
} = require('../tokenizer');

describe('tokenizeKey', () => {
  it('splits a simple key into segments', () => {
    const result = tokenizeKey('DB_HOST');
    expect(result.segments).toEqual(['DB', 'HOST']);
    expect(result.depth).toBe(2);
    expect(result.prefix).toBe('DB');
    expect(result.base).toBe('HOST');
  });

  it('handles a single-segment key', () => {
    const result = tokenizeKey('PORT');
    expect(result.segments).toEqual(['PORT']);
    expect(result.depth).toBe(1);
    expect(result.prefix).toBeNull();
    expect(result.base).toBe('PORT');
  });

  it('handles deeply nested keys', () => {
    const result = tokenizeKey('APP_DB_PRIMARY_HOST');
    expect(result.depth).toBe(4);
    expect(result.prefix).toBe('APP');
    expect(result.base).toBe('HOST');
  });

  it('supports custom delimiter', () => {
    const result = tokenizeKey('APP.DB.HOST', '.');
    expect(result.segments).toEqual(['APP', 'DB', 'HOST']);
    expect(result.prefix).toBe('APP');
  });

  it('throws on empty key', () => {
    expect(() => tokenizeKey('')).toThrow();
  });

  it('throws on non-string key', () => {
    expect(() => tokenizeKey(null)).toThrow();
  });
});

describe('tokenizeEnv', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', PORT: '3000' };

  it('returns one token per key', () => {
    const tokens = tokenizeEnv(env);
    expect(tokens).toHaveLength(3);
  });

  it('includes value in each token', () => {
    const tokens = tokenizeEnv(env);
    const dbHost = tokens.find(t => t.key === 'DB_HOST');
    expect(dbHost.value).toBe('localhost');
  });

  it('throws on invalid input', () => {
    expect(() => tokenizeEnv(null)).toThrow();
  });
});

describe('groupTokensByPrefix', () => {
  it('groups tokens by their prefix', () => {
    const tokens = tokenizeEnv({ DB_HOST: 'localhost', DB_PORT: '5432', PORT: '3000' });
    const groups = groupTokensByPrefix(tokens);
    expect(groups['DB']).toHaveLength(2);
    expect(groups['__root__']).toHaveLength(1);
  });
});

describe('summarizeTokens', () => {
  it('returns total, maxDepth, and prefixes', () => {
    const tokens = tokenizeEnv({ DB_HOST: 'localhost', DB_PORT: '5432', PORT: '3000' });
    const summary = summarizeTokens(tokens);
    expect(summary.total).toBe(3);
    expect(summary.maxDepth).toBe(2);
    expect(summary.prefixes).toContain('DB');
  });

  it('handles flat env with no prefixes', () => {
    const tokens = tokenizeEnv({ PORT: '3000', HOST: 'localhost' });
    const summary = summarizeTokens(tokens);
    expect(summary.prefixes).toHaveLength(0);
    expect(summary.maxDepth).toBe(1);
  });
});
