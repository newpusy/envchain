const { diffEnvs, isEnvEqual, summarizeDiff } = require('../differ');

describe('diffEnvs', () => {
  it('detects added keys', () => {
    const prev = { A: '1' };
    const curr = { A: '1', B: '2' };
    const { added, removed, changed } = diffEnvs(prev, curr);
    expect(added).toEqual({ B: '2' });
    expect(removed).toEqual({});
    expect(changed).toEqual({});
  });

  it('detects removed keys', () => {
    const prev = { A: '1', B: '2' };
    const curr = { A: '1' };
    const { added, removed, changed } = diffEnvs(prev, curr);
    expect(removed).toEqual({ B: '2' });
    expect(added).toEqual({});
    expect(changed).toEqual({});
  });

  it('detects changed values', () => {
    const prev = { A: 'old' };
    const curr = { A: 'new' };
    const { changed } = diffEnvs(prev, curr);
    expect(changed).toEqual({ A: { from: 'old', to: 'new' } });
  });

  it('handles empty objects', () => {
    const { added, removed, changed } = diffEnvs({}, {});
    expect(added).toEqual({});
    expect(removed).toEqual({});
    expect(changed).toEqual({});
  });

  it('handles multiple changes at once', () => {
    const prev = { A: '1', B: '2', C: '3' };
    const curr = { A: '99', D: '4' };
    const { added, removed, changed } = diffEnvs(prev, curr);
    expect(added).toEqual({ D: '4' });
    expect(removed).toEqual({ B: '2', C: '3' });
    expect(changed).toEqual({ A: { from: '1', to: '99' } });
  });
});

describe('isEnvEqual', () => {
  it('returns true for identical envs', () => {
    expect(isEnvEqual({ A: '1' }, { A: '1' })).toBe(true);
  });

  it('returns false when keys differ', () => {
    expect(isEnvEqual({ A: '1' }, { A: '1', B: '2' })).toBe(false);
  });

  it('returns false when values differ', () => {
    expect(isEnvEqual({ A: '1' }, { A: '2' })).toBe(false);
  });
});

describe('summarizeDiff', () => {
  it('formats added, removed and changed lines', () => {
    const diff = {
      added: { B: '2' },
      removed: { C: '3' },
      changed: { A: { from: 'old', to: 'new' } },
    };
    const summary = summarizeDiff(diff);
    expect(summary).toContain('+ B=2');
    expect(summary).toContain('- C=3');
    expect(summary).toContain('~ A: old -> new');
  });

  it('returns (no changes) for empty diff', () => {
    expect(summarizeDiff({ added: {}, removed: {}, changed: {} })).toBe('(no changes)');
  });
});
