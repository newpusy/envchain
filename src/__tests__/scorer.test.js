const { scoreEntry, scoreEnv, summarizeScore } = require('../scorer');

describe('scoreEntry', () => {
  it('returns full score for a clean entry', () => {
    const { score, reasons } = scoreEntry('APP_NAME', 'myapp');
    expect(score).toBe(100);
    expect(reasons).toHaveLength(0);
  });

  it('penalizes empty value', () => {
    const { score, reasons } = scoreEntry('APP_NAME', '');
    expect(score).toBeLessThan(100);
    expect(reasons).toContain('empty value');
  });

  it('penalizes placeholder values', () => {
    const { score, reasons } = scoreEntry('API_URL', 'changeme');
    expect(score).toBeLessThan(60);
    expect(reasons).toContain('placeholder value detected');
  });

  it('penalizes sensitive key with short value', () => {
    const { score, reasons } = scoreEntry('DB_PASSWORD', 'abc');
    expect(reasons).toContain('sensitive key has short value');
    expect(score).toBeLessThan(80);
  });

  it('penalizes non-SCREAMING_SNAKE_CASE key', () => {
    const { score, reasons } = scoreEntry('myKey', 'value');
    expect(reasons).toContain('key not in SCREAMING_SNAKE_CASE');
  });

  it('penalizes sensitive key with weak boolean value', () => {
    const { score, reasons } = scoreEntry('AUTH_TOKEN', 'true');
    expect(reasons).toContain('sensitive key has weak boolean-like value');
    expect(score).toBeLessThan(60);
  });

  it('returns score 0 for empty key', () => {
    const { score } = scoreEntry('', 'value');
    expect(score).toBe(0);
  });
});

describe('scoreEnv', () => {
  it('scores all entries and returns overall average', () => {
    const env = {
      APP_NAME: 'myapp',
      DB_PASSWORD: 'supersecretpassword123',
      NODE_ENV: 'production'
    };
    const result = scoreEnv(env);
    expect(result.overall).toBeGreaterThan(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(Object.keys(result.entries)).toHaveLength(3);
  });

  it('returns 100 for empty env', () => {
    const result = scoreEnv({});
    expect(result.overall).toBe(100);
  });

  it('reflects individual entry scores in overall', () => {
    const env = { BAD_KEY: 'changeme', GOOD_KEY: 'solidvalue' };
    const result = scoreEnv(env);
    expect(result.entries['BAD_KEY'].score).toBeLessThan(result.entries['GOOD_KEY'].score);
  });
});

describe('summarizeScore', () => {
  it('includes overall score line', () => {
    const result = scoreEnv({ APP: 'test' });
    const summary = summarizeScore(result);
    expect(summary).toMatch(/Overall score:/);
  });

  it('lists issues for problematic entries', () => {
    const result = scoreEnv({ DB_SECRET: 'todo' });
    const summary = summarizeScore(result);
    expect(summary).toMatch(/DB_SECRET/);
    expect(summary).toMatch(/placeholder/);
  });

  it('does not list entries with no issues', () => {
    const result = scoreEnv({ CLEAN_KEY: 'cleanvalue' });
    const summary = summarizeScore(result);
    const lines = summary.split('\n');
    expect(lines).toHaveLength(1);
  });
});
