const { classifyKey, classifyEnv, groupByCategory, summarizeClassification } = require('../classifier');

describe('classifyKey', () => {
  it('classifies auth keys', () => {
    expect(classifyKey('JWT_SECRET')).toBe('auth');
    expect(classifyKey('API_KEY')).toBe('auth');
    expect(classifyKey('PASSWORD')).toBe('auth');
  });

  it('classifies database keys', () => {
    expect(classifyKey('DB_HOST')).toBe('database');
    expect(classifyKey('POSTGRES_URL')).toBe('database');
    expect(classifyKey('REDIS_PORT')).toBe('database');
  });

  it('classifies network keys', () => {
    expect(classifyKey('PORT')).toBe('network');
    expect(classifyKey('API_URL')).toBe('network');
    expect(classifyKey('HOST')).toBe('network');
  });

  it('classifies feature flags', () => {
    expect(classifyKey('FEATURE_DARK_MODE')).toBe('feature');
    expect(classifyKey('ENABLE_CACHE')).toBe('feature');
    expect(classifyKey('TOGGLE_BETA')).toBe('feature');
  });

  it('classifies logging keys', () => {
    expect(classifyKey('LOG_LEVEL')).toBe('logging');
    expect(classifyKey('DEBUG')).toBe('logging');
  });

  it('classifies infra keys', () => {
    expect(classifyKey('AWS_REGION')).toBe('infra');
    expect(classifyKey('S3_BUCKET')).toBe('infra');
  });

  it('classifies email keys', () => {
    expect(classifyKey('SMTP_HOST')).toBe('email');
    expect(classifyKey('SENDGRID_API_KEY')).toBe('email');
  });

  it('classifies app keys', () => {
    expect(classifyKey('APP_NAME')).toBe('app');
    expect(classifyKey('NODE_ENV')).toBe('app');
  });

  it('returns other for unknown keys', () => {
    expect(classifyKey('FOOBAR')).toBe('other');
    expect(classifyKey('XYZ_123')).toBe('other');
  });

  it('returns other for empty or invalid input', () => {
    expect(classifyKey('')).toBe('other');
    expect(classifyKey(null)).toBe('other');
  });
});

describe('classifyEnv', () => {
  it('annotates each key with its category', () => {
    const env = { JWT_SECRET: 'abc', PORT: '3000', FOOBAR: 'x' };
    const result = classifyEnv(env);
    expect(result.JWT_SECRET).toEqual({ value: 'abc', category: 'auth' });
    expect(result.PORT).toEqual({ value: '3000', category: 'network' });
    expect(result.FOOBAR).toEqual({ value: 'x', category: 'other' });
  });
});

describe('groupByCategory', () => {
  it('groups keys by their category', () => {
    const env = { JWT_SECRET: 'x', API_KEY: 'y', PORT: '3000', LOG_LEVEL: 'info' };
    const groups = groupByCategory(env);
    expect(groups.auth).toContain('JWT_SECRET');
    expect(groups.auth).toContain('API_KEY');
    expect(groups.network).toContain('PORT');
    expect(groups.logging).toContain('LOG_LEVEL');
  });
});

describe('summarizeClassification', () => {
  it('returns total and breakdown counts', () => {
    const env = { JWT_SECRET: 'x', PORT: '3000', DB_URL: 'y', FOOBAR: 'z' };
    const summary = summarizeClassification(env);
    expect(summary.total).toBe(4);
    expect(summary.breakdown.auth).toBe(1);
    expect(summary.breakdown.network).toBe(1);
    expect(summary.breakdown.database).toBe(1);
    expect(summary.breakdown.other).toBe(1);
  });

  it('handles empty env', () => {
    const summary = summarizeClassification({});
    expect(summary.total).toBe(0);
    expect(summary.breakdown).toEqual({});
  });
});
