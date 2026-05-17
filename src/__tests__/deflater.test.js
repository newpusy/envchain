const { isDefaultValue, deflateAgainstBaseline, deflateEnv, deflateSummary } = require('../deflater');

describe('isDefaultValue', () => {
  it('returns true for empty string', () => {
    expect(isDefaultValue('')).toBe(true);
  });

  it('returns true for null and undefined', () => {
    expect(isDefaultValue(null)).toBe(true);
    expect(isDefaultValue(undefined)).toBe(true);
  });

  it('returns true for "0", "false", "null", "undefined"', () => {
    expect(isDefaultValue('0')).toBe(true);
    expect(isDefaultValue('false')).toBe(true);
    expect(isDefaultValue('null')).toBe(true);
    expect(isDefaultValue('undefined')).toBe(true);
  });

  it('returns false for meaningful values', () => {
    expect(isDefaultValue('hello')).toBe(false);
    expect(isDefaultValue('1')).toBe(false);
    expect(isDefaultValue('true')).toBe(false);
  });
});

describe('deflateAgainstBaseline', () => {
  const baseline = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };

  it('removes keys matching baseline values', () => {
    const env = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
    const result = deflateAgainstBaseline(env, baseline);
    expect(result).toEqual({ DEBUG: 'true' });
  });

  it('keeps keys not present in baseline', () => {
    const env = { HOST: 'localhost', NEW_KEY: 'value' };
    const result = deflateAgainstBaseline(env, baseline);
    expect(result).toEqual({ NEW_KEY: 'value' });
  });

  it('returns empty object when all keys match baseline', () => {
    const result = deflateAgainstBaseline({ HOST: 'localhost', PORT: '3000' }, baseline);
    expect(result).toEqual({});
  });
});

describe('deflateEnv', () => {
  it('strips empty string values by default', () => {
    const env = { A: 'hello', B: '', C: 'world' };
    expect(deflateEnv(env)).toEqual({ A: 'hello', C: 'world' });
  });

  it('strips falsy values when stripFalsy is true', () => {
    const env = { A: 'hello', B: '0', C: 'false', D: 'true' };
    const result = deflateEnv(env, { stripFalsy: true });
    expect(result).toEqual({ A: 'hello', D: 'true' });
  });

  it('keeps empty values when stripEmpty is false', () => {
    const env = { A: '', B: 'value' };
    const result = deflateEnv(env, { stripEmpty: false });
    expect(result).toEqual({ A: '', B: 'value' });
  });

  it('returns empty object for all-empty env', () => {
    expect(deflateEnv({ A: '', B: '' })).toEqual({});
  });
});

describe('deflateSummary', () => {
  it('reports correct counts and removed keys', () => {
    const original = { A: '1', B: '2', C: '3' };
    const deflated = { A: '1' };
    const summary = deflateSummary(original, deflated);
    expect(summary.originalCount).toBe(3);
    expect(summary.deflatedCount).toBe(1);
    expect(summary.removedCount).toBe(2);
    expect(summary.removedKeys).toEqual(expect.arrayContaining(['B', 'C']));
  });

  it('reports zero removed when nothing was deflated', () => {
    const env = { A: '1' };
    const summary = deflateSummary(env, env);
    expect(summary.removedCount).toBe(0);
    expect(summary.removedKeys).toEqual([]);
  });
});
