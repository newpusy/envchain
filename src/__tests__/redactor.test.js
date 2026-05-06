const { isSensitiveKey, redactValue, redactEnv } = require('../redactor');

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('api_token')).toBe(true);
  });

  it('detects secret keys', () => {
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
  });

  it('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('APIKEY')).toBe(true);
  });

  it('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('APP_ENV')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('BASE_URL')).toBe(false);
  });

  it('supports custom patterns', () => {
    expect(isSensitiveKey('MY_CUSTOM_FIELD', [/custom/i])).toBe(true);
    expect(isSensitiveKey('APP_ENV', [/custom/i])).toBe(false);
  });
});

describe('redactValue', () => {
  it('redacts sensitive values', () => {
    expect(redactValue('DB_PASSWORD', 'supersecret')).toBe('[REDACTED]');
  });

  it('leaves non-sensitive values intact', () => {
    expect(redactValue('APP_ENV', 'production')).toBe('production');
  });

  it('supports custom redact string', () => {
    expect(redactValue('API_KEY', '12345', { redactWith: '***' })).toBe('***');
  });
});

describe('redactEnv', () => {
  const env = {
    APP_ENV: 'production',
    DB_PASSWORD: 'supersecret',
    ACCESS_TOKEN: 'abc123',
    PORT: '3000',
  };

  it('redacts sensitive keys and keeps others', () => {
    const result = redactEnv(env);
    expect(result.APP_ENV).toBe('production');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe('[REDACTED]');
    expect(result.ACCESS_TOKEN).toBe('[REDACTED]');
  });

  it('does not mutate the original env', () => {
    redactEnv(env);
    expect(env.DB_PASSWORD).toBe('supersecret');
  });

  it('throws on invalid input', () => {
    expect(() => redactEnv(null)).toThrow(TypeError);
    expect(() => redactEnv('string')).toThrow(TypeError);
  });

  it('supports custom redact value', () => {
    const result = redactEnv(env, { redactWith: '<hidden>' });
    expect(result.DB_PASSWORD).toBe('<hidden>');
  });
});
