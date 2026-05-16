const { cloneEnv, cloneKeys, cloneWithout, cloneImmutable, cloneSummary } = require('../cloner');

describe('cloneEnv', () => {
  it('returns a shallow copy of the env object', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const cloned = cloneEnv(env);
    expect(cloned).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(cloned).not.toBe(env);
  });

  it('returns a null-prototype object', () => {
    const cloned = cloneEnv({ A: '1' });
    expect(Object.getPrototypeOf(cloned)).toBeNull();
  });

  it('throws on non-object input', () => {
    expect(() => cloneEnv(null)).toThrow(TypeError);
    expect(() => cloneEnv('string')).toThrow(TypeError);
  });
});

describe('cloneKeys', () => {
  const env = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('clones only specified keys', () => {
    const result = cloneKeys(env, ['FOO', 'BAZ']);
    expect(result).toEqual({ FOO: 'foo', BAZ: 'baz' });
    expect(result).not.toHaveProperty('BAR');
  });

  it('ignores keys not present in env', () => {
    const result = cloneKeys(env, ['FOO', 'MISSING']);
    expect(result).toEqual({ FOO: 'foo' });
  });

  it('throws if keys is not an array', () => {
    expect(() => cloneKeys(env, 'FOO')).toThrow(TypeError);
  });

  it('returns empty object for empty keys array', () => {
    expect(cloneKeys(env, [])).toEqual({});
  });
});

describe('cloneWithout', () => {
  const env = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('clones env excluding specified keys', () => {
    const result = cloneWithout(env, ['BAR']);
    expect(result).toEqual({ FOO: 'foo', BAZ: 'baz' });
  });

  it('returns full clone when excludeKeys is empty', () => {
    const result = cloneWithout(env, []);
    expect(result).toEqual(env);
  });

  it('throws if excludeKeys is not an array', () => {
    expect(() => cloneWithout(env, 'BAR')).toThrow(TypeError);
  });
});

describe('cloneImmutable', () => {
  it('returns a frozen copy of the env', () => {
    const env = { SECRET: 'abc' };
    const frozen = cloneImmutable(env);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(frozen).toEqual({ SECRET: 'abc' });
  });

  it('does not mutate original', () => {
    const env = { KEY: 'val' };
    const frozen = cloneImmutable(env);
    expect(() => { frozen.KEY = 'changed'; }).toThrow();
    expect(env.KEY).toBe('val');
  });
});

describe('cloneSummary', () => {
  it('returns count and keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const summary = cloneSummary(env);
    expect(summary.count).toBe(3);
    expect(summary.keys).toEqual(expect.arrayContaining(['A', 'B', 'C']));
  });

  it('handles empty env', () => {
    const summary = cloneSummary({});
    expect(summary.count).toBe(0);
    expect(summary.keys).toEqual([]);
  });
});
