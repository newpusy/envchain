const { freezeEnv, isFrozen, safeSet, thawEnv, freezeSummary } = require('../freezer');

describe('freezeEnv', () => {
  it('returns a frozen object', () => {
    const result = freezeEnv({ PORT: '3000' });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('preserves all key-value pairs', () => {
    const result = freezeEnv({ A: '1', B: '2' });
    expect(result).toEqual({ A: '1', B: '2' });
  });

  it('throws on non-object input', () => {
    expect(() => freezeEnv('nope')).toThrow(TypeError);
    expect(() => freezeEnv(null)).toThrow(TypeError);
  });

  it('does not mutate the original object', () => {
    const original = { X: '1' };
    freezeEnv(original);
    expect(Object.isFrozen(original)).toBe(false);
  });
});

describe('isFrozen', () => {
  it('returns true for a frozen object', () => {
    expect(isFrozen(Object.freeze({ A: '1' }))).toBe(true);
  });

  it('returns false for a mutable object', () => {
    expect(isFrozen({ A: '1' })).toBe(false);
  });
});

describe('safeSet', () => {
  it('returns a new frozen object when env is frozen', () => {
    const env = freezeEnv({ A: '1' });
    const result = safeSet(env, 'B', '2');
    expect(result.B).toBe('2');
    expect(Object.isFrozen(result)).toBe(true);
    expect(env.B).toBeUndefined();
  });

  it('mutates and returns the same object when not frozen', () => {
    const env = { A: '1' };
    const result = safeSet(env, 'B', '2');
    expect(result).toBe(env);
    expect(env.B).toBe('2');
  });
});

describe('thawEnv', () => {
  it('returns a mutable copy of a frozen env', () => {
    const frozen = freezeEnv({ A: '1' });
    const thawed = thawEnv(frozen);
    expect(Object.isFrozen(thawed)).toBe(false);
    expect(thawed).toEqual({ A: '1' });
  });

  it('throws on non-object input', () => {
    expect(() => thawEnv(42)).toThrow(TypeError);
  });
});

describe('freezeSummary', () => {
  it('reports frozen status and key count', () => {
    const env = freezeEnv({ A: '1', B: '2', C: '3' });
    expect(freezeSummary(env)).toEqual({ frozen: true, keyCount: 3 });
  });

  it('reports unfrozen status', () => {
    expect(freezeSummary({ X: '1' })).toEqual({ frozen: false, keyCount: 1 });
  });
});
