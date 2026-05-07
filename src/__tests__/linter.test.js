const { lintKey, lintValue, lintEnv } = require('../linter');

describe('lintKey', () => {
  it('passes a valid uppercase key', () => {
    const { issues } = lintKey('DATABASE_URL');
    expect(issues).toHaveLength(0);
  });

  it('flags a lowercase key', () => {
    const { issues } = lintKey('database_url');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/does not match recommended pattern/);
  });

  it('flags an empty key', () => {
    const { issues } = lintKey('');
    expect(issues).toContain('key is empty');
  });

  it('flags a key ending with underscore', () => {
    const { issues } = lintKey('MY_VAR_');
    expect(issues.some(i => i.includes('ends with underscore'))).toBe(true);
  });

  it('flags a key starting with underscore', () => {
    const { issues } = lintKey('_PRIVATE');
    expect(issues.some(i => i.includes('starts with underscore'))).toBe(true);
  });

  it('flags a key with double underscore', () => {
    const { issues } = lintKey('MY__VAR');
    expect(issues.some(i => i.includes('double underscore'))).toBe(true);
  });

  it('passes a single-word key', () => {
    const { issues } = lintKey('PORT');
    expect(issues).toHaveLength(0);
  });
});

describe('lintValue', () => {
  it('passes a clean value', () => {
    const { issues } = lintValue('HOST', 'localhost');
    expect(issues).toHaveLength(0);
  });

  it('flags leading whitespace', () => {
    const { issues } = lintValue('HOST', ' localhost');
    expect(issues.some(i => i.includes('leading or trailing whitespace'))).toBe(true);
  });

  it('flags trailing whitespace', () => {
    const { issues } = lintValue('HOST', 'localhost ');
    expect(issues.some(i => i.includes('leading or trailing whitespace'))).toBe(true);
  });

  it('flags multiple consecutive spaces', () => {
    const { issues } = lintValue('DESC', 'hello  world');
    expect(issues.some(i => i.includes('multiple consecutive spaces'))).toBe(true);
  });

  it('flags null value', () => {
    const { issues } = lintValue('KEY', null);
    expect(issues.some(i => i.includes('null or undefined'))).toBe(true);
  });
});

describe('lintEnv', () => {
  it('returns valid true for clean env', () => {
    const env = { PORT: '3000', DATABASE_URL: 'postgres://localhost/db' };
    const { valid, results } = lintEnv(env);
    expect(valid).toBe(true);
    expect(results).toHaveLength(0);
  });

  it('returns valid false and collects issues', () => {
    const env = { port: '3000', BAD_VAL: ' oops ' };
    const { valid, results } = lintEnv(env);
    expect(valid).toBe(false);
    expect(results.length).toBeGreaterThan(0);
  });

  it('groups issues by key', () => {
    const env = { bad_key: ' bad value ' };
    const { results } = lintEnv(env);
    expect(results[0].key).toBe('bad_key');
    expect(results[0].issues.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty env object', () => {
    const { valid, results } = lintEnv({});
    expect(valid).toBe(true);
    expect(results).toHaveLength(0);
  });
});
