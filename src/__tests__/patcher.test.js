const { patchEnv, patchExisting, removeKeys, previewPatch } = require('../patcher');

describe('patchEnv', () => {
  it('merges patch into env', () => {
    const env = { A: '1', B: '2' };
    const result = patchEnv(env, { B: '99', C: '3' });
    expect(result).toEqual({ A: '1', B: '99', C: '3' });
  });

  it('does not mutate original env', () => {
    const env = { A: '1' };
    patchEnv(env, { A: '2' });
    expect(env.A).toBe('1');
  });

  it('throws on invalid env', () => {
    expect(() => patchEnv(null, {})).toThrow(TypeError);
  });

  it('throws on invalid patch', () => {
    expect(() => patchEnv({}, null)).toThrow(TypeError);
  });
});

describe('patchExisting', () => {
  it('only updates keys that exist in env', () => {
    const env = { A: '1', B: '2' };
    const result = patchExisting(env, { B: '99', C: 'new' });
    expect(result).toEqual({ A: '1', B: '99' });
    expect(result).not.toHaveProperty('C');
  });

  it('returns copy when no matching keys', () => {
    const env = { A: '1' };
    const result = patchExisting(env, { Z: '9' });
    expect(result).toEqual({ A: '1' });
  });

  it('throws on invalid inputs', () => {
    expect(() => patchExisting(null, {})).toThrow(TypeError);
    expect(() => patchExisting({}, 'bad')).toThrow(TypeError);
  });
});

describe('removeKeys', () => {
  it('removes specified keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = removeKeys(env, ['A', 'C']);
    expect(result).toEqual({ B: '2' });
  });

  it('ignores keys not in env', () => {
    const env = { A: '1' };
    const result = removeKeys(env, ['Z']);
    expect(result).toEqual({ A: '1' });
  });

  it('throws on invalid inputs', () => {
    expect(() => removeKeys(null, [])).toThrow(TypeError);
    expect(() => removeKeys({}, 'bad')).toThrow(TypeError);
  });
});

describe('previewPatch', () => {
  it('categorizes added, updated, and unchanged keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const patch = { A: '1', B: '99', D: 'new' };
    const result = previewPatch(env, patch);
    expect(result.added).toEqual(['D']);
    expect(result.updated).toEqual(['B']);
    expect(result.unchanged).toEqual(['A']);
  });

  it('returns empty arrays when patch is empty', () => {
    const result = previewPatch({ A: '1' }, {});
    expect(result).toEqual({ added: [], updated: [], unchanged: [] });
  });

  it('throws on invalid inputs', () => {
    expect(() => previewPatch(null, {})).toThrow(TypeError);
    expect(() => previewPatch({}, null)).toThrow(TypeError);
  });
});
