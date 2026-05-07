const {
  compareKey,
  compareEnvs,
  filterByStatus,
  summarizeComparison,
} = require('../comparator');

const envA = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
const envB = { HOST: 'example.com', PORT: '3000', LOG_LEVEL: 'info' };

describe('compareKey', () => {
  it('returns equal when values match', () => {
    const result = compareKey('PORT', envA, envB);
    expect(result.status).toBe('equal');
    expect(result.valueA).toBe('3000');
    expect(result.valueB).toBe('3000');
  });

  it('returns changed when values differ', () => {
    const result = compareKey('HOST', envA, envB);
    expect(result.status).toBe('changed');
    expect(result.valueA).toBe('localhost');
    expect(result.valueB).toBe('example.com');
  });

  it('returns removed when key only in envA', () => {
    const result = compareKey('DEBUG', envA, envB);
    expect(result.status).toBe('removed');
    expect(result.valueB).toBeUndefined();
  });

  it('returns added when key only in envB', () => {
    const result = compareKey('LOG_LEVEL', envA, envB);
    expect(result.status).toBe('added');
    expect(result.valueA).toBeUndefined();
  });
});

describe('compareEnvs', () => {
  it('returns a result for every unique key', () => {
    const results = compareEnvs(envA, envB);
    const keys = results.map((r) => r.key);
    expect(keys).toContain('HOST');
    expect(keys).toContain('PORT');
    expect(keys).toContain('DEBUG');
    expect(keys).toContain('LOG_LEVEL');
  });

  it('returns results sorted by key', () => {
    const results = compareEnvs(envA, envB);
    const keys = results.map((r) => r.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles empty envs', () => {
    expect(compareEnvs({}, {})).toEqual([]);
  });
});

describe('filterByStatus', () => {
  it('filters only changed entries', () => {
    const results = compareEnvs(envA, envB);
    const changed = filterByStatus(results, 'changed');
    expect(changed.every((r) => r.status === 'changed')).toBe(true);
  });

  it('returns empty array when no matches', () => {
    const results = compareEnvs({ A: '1' }, { A: '1' });
    expect(filterByStatus(results, 'added')).toEqual([]);
  });
});

describe('summarizeComparison', () => {
  it('counts statuses correctly', () => {
    const results = compareEnvs(envA, envB);
    const summary = summarizeComparison(results);
    expect(summary.equal).toBe(1);
    expect(summary.changed).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.total).toBe(4);
  });

  it('returns zeros for identical envs', () => {
    const results = compareEnvs({ X: '1' }, { X: '1' });
    const summary = summarizeComparison(results);
    expect(summary.equal).toBe(1);
    expect(summary.changed).toBe(0);
    expect(summary.added).toBe(0);
    expect(summary.removed).toBe(0);
  });
});
