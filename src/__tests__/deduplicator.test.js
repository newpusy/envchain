const {
  findDuplicates,
  deduplicatePairs,
  deduplicateEnvs,
  summarizeDuplicates,
} = require('../deduplicator');

describe('findDuplicates', () => {
  it('returns empty object when no duplicates', () => {
    const result = findDuplicates([{ A: '1' }, { B: '2' }]);
    expect(result).toEqual({});
  });

  it('detects duplicate keys across envs', () => {
    const result = findDuplicates([{ A: '1', B: '2' }, { A: '3' }]);
    expect(result).toEqual({ A: [0, 1] });
  });

  it('tracks multiple sources for the same key', () => {
    const result = findDuplicates([{ X: '1' }, { X: '2' }, { X: '3' }]);
    expect(result.X).toEqual([0, 1, 2]);
  });
});

describe('deduplicatePairs', () => {
  const pairs = [
    { key: 'A', value: 'first' },
    { key: 'B', value: 'only' },
    { key: 'A', value: 'second' },
  ];

  it('keeps first occurrence by default', () => {
    const result = deduplicatePairs(pairs);
    expect(result.find((p) => p.key === 'A').value).toBe('first');
  });

  it('keeps last occurrence with last strategy', () => {
    const result = deduplicatePairs(pairs, 'last');
    expect(result.find((p) => p.key === 'A').value).toBe('second');
  });

  it('preserves non-duplicate keys', () => {
    const result = deduplicatePairs(pairs);
    expect(result.find((p) => p.key === 'B').value).toBe('only');
  });
});

describe('deduplicateEnvs', () => {
  const envA = { HOST: 'localhost', PORT: '3000' };
  const envB = { PORT: '4000', DEBUG: 'true' };

  it('last strategy: later value wins', () => {
    const result = deduplicateEnvs([envA, envB], 'last');
    expect(result.PORT).toBe('4000');
    expect(result.HOST).toBe('localhost');
    expect(result.DEBUG).toBe('true');
  });

  it('first strategy: earlier value wins', () => {
    const result = deduplicateEnvs([envA, envB], 'first');
    expect(result.PORT).toBe('3000');
  });

  it('error strategy: throws when duplicates exist', () => {
    expect(() => deduplicateEnvs([envA, envB], 'error')).toThrow(
      /Duplicate keys found/
    );
  });

  it('error strategy: does not throw when no duplicates', () => {
    const result = deduplicateEnvs([{ A: '1' }, { B: '2' }], 'error');
    expect(result).toEqual({ A: '1', B: '2' });
  });
});

describe('summarizeDuplicates', () => {
  it('reports no duplicates', () => {
    const summary = summarizeDuplicates([{ A: '1' }, { B: '2' }]);
    expect(summary.hasDuplicates).toBe(false);
    expect(summary.count).toBe(0);
    expect(summary.keys).toEqual([]);
  });

  it('reports duplicates correctly', () => {
    const summary = summarizeDuplicates([{ A: '1' }, { A: '2', B: '3' }, { B: '4' }]);
    expect(summary.hasDuplicates).toBe(true);
    expect(summary.count).toBe(2);
    expect(summary.keys).toContain('A');
    expect(summary.keys).toContain('B');
  });
});
