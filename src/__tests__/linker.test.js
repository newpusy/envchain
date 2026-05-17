const { linkKey, applyLinks, resolveLink, summarizeLinks } = require('../linker');

describe('linkKey', () => {
  const env = { DB_URL: 'postgres://localhost/db', APP_NAME: 'myapp' };

  it('returns a link descriptor with value from target key', () => {
    const link = linkKey('DATABASE_URL', 'DB_URL', env);
    expect(link).toEqual({ from: 'DATABASE_URL', to: 'DB_URL', value: 'postgres://localhost/db' });
  });

  it('returns undefined value if target key does not exist', () => {
    const link = linkKey('MISSING', 'NOT_THERE', env);
    expect(link.value).toBeUndefined();
  });
});

describe('applyLinks', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP: 'envchain' };

  it('injects linked keys into the result', () => {
    const result = applyLinks(env, { DATABASE_HOST: 'DB_HOST', DATABASE_PORT: 'DB_PORT' });
    expect(result.DATABASE_HOST).toBe('localhost');
    expect(result.DATABASE_PORT).toBe('5432');
  });

  it('does not overwrite existing keys unrelated to links', () => {
    const result = applyLinks(env, { DATABASE_HOST: 'DB_HOST' });
    expect(result.APP).toBe('envchain');
    expect(result.DB_HOST).toBe('localhost');
  });

  it('skips links where target key does not exist in env', () => {
    const result = applyLinks(env, { GHOST: 'NONEXISTENT' });
    expect('GHOST' in result).toBe(false);
  });

  it('does not mutate original env', () => {
    applyLinks(env, { DATABASE_HOST: 'DB_HOST' });
    expect('DATABASE_HOST' in env).toBe(false);
  });
});

describe('resolveLink', () => {
  const env = {
    A: 'B',
    B: 'C',
    C: 'final_value',
    LOOP: 'LOOP',
    PLAIN: 'hello world',
  };

  it('resolves a chain of key references to a concrete value', () => {
    expect(resolveLink('A', env)).toBe('final_value');
  });

  it('returns the value directly if it is not a key reference', () => {
    expect(resolveLink('PLAIN', env)).toBe('hello world');
  });

  it('returns undefined for missing keys', () => {
    expect(resolveLink('MISSING', env)).toBeUndefined();
  });

  it('handles self-referencing key without infinite loop', () => {
    const result = resolveLink('LOOP', env);
    // LOOP -> LOOP: value is 'LOOP' itself, same key, should return env[LOOP] = 'LOOP'
    expect(result).toBe('LOOP');
  });
});

describe('summarizeLinks', () => {
  const env = {
    PRIMARY_DB: 'DB_URL',
    DB_URL: 'postgres://localhost/db',
    ALIAS_HOST: 'DB_HOST',
    DB_HOST: 'localhost',
    APP_NAME: 'my-app',
  };

  it('identifies keys whose values reference other env keys', () => {
    const links = summarizeLinks(env);
    expect(links).toHaveLength(2);
    const keys = links.map(l => l.key);
    expect(keys).toContain('PRIMARY_DB');
    expect(keys).toContain('ALIAS_HOST');
  });

  it('includes resolved values in the summary', () => {
    const links = summarizeLinks(env);
    const dbLink = links.find(l => l.key === 'PRIMARY_DB');
    expect(dbLink.resolvedValue).toBe('postgres://localhost/db');
  });

  it('does not include non-linking keys', () => {
    const links = summarizeLinks(env);
    const keys = links.map(l => l.key);
    expect(keys).not.toContain('APP_NAME');
  });
});
