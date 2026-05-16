const { checkType, typecheckEnv, summarizeTypecheck, TYPES } = require('../typecheck');

describe('TYPES', () => {
  it('exports a list of supported types', () => {
    expect(TYPES).toContain('string');
    expect(TYPES).toContain('number');
    expect(TYPES).toContain('boolean');
    expect(TYPES).toContain('integer');
    expect(TYPES).toContain('url');
    expect(TYPES).toContain('email');
  });
});

describe('checkType', () => {
  it('validates string', () => {
    expect(checkType('hello', 'string')).toBe(true);
    expect(checkType('', 'string')).toBe(true);
  });

  it('validates number', () => {
    expect(checkType('3.14', 'number')).toBe(true);
    expect(checkType('42', 'number')).toBe(true);
    expect(checkType('abc', 'number')).toBe(false);
    expect(checkType('', 'number')).toBe(false);
  });

  it('validates integer', () => {
    expect(checkType('10', 'integer')).toBe(true);
    expect(checkType('3.5', 'integer')).toBe(false);
    expect(checkType('abc', 'integer')).toBe(false);
  });

  it('validates boolean', () => {
    expect(checkType('true', 'boolean')).toBe(true);
    expect(checkType('false', 'boolean')).toBe(true);
    expect(checkType('1', 'boolean')).toBe(true);
    expect(checkType('yes', 'boolean')).toBe(true);
    expect(checkType('maybe', 'boolean')).toBe(false);
  });

  it('validates url', () => {
    expect(checkType('https://example.com', 'url')).toBe(true);
    expect(checkType('not-a-url', 'url')).toBe(false);
  });

  it('validates email', () => {
    expect(checkType('user@example.com', 'email')).toBe(true);
    expect(checkType('not-an-email', 'email')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(checkType(null, 'string')).toBe(false);
    expect(checkType(undefined, 'number')).toBe(false);
  });
});

describe('typecheckEnv', () => {
  const env = {
    PORT: '3000',
    DEBUG: 'true',
    API_URL: 'https://api.example.com',
    EMAIL: 'admin@example.com',
    NAME: 'myapp',
  };

  it('returns valid when all types match', () => {
    const schema = {
      PORT: 'integer',
      DEBUG: 'boolean',
      API_URL: 'url',
      EMAIL: 'email',
      NAME: 'string',
    };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('collects errors for mismatched types', () => {
    const schema = { PORT: 'email', DEBUG: 'url' };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].key).toBe('PORT');
  });

  it('flags unknown types', () => {
    const result = typecheckEnv(env, { PORT: 'uuid' });
    expect(result.valid).toBe(false);
    expect(result.errors[0].error).toBe('unknown type');
  });
});

describe('summarizeTypecheck', () => {
  it('returns success message when valid', () => {
    const msg = summarizeTypecheck({ valid: true, errors: [] });
    expect(msg).toBe('All type checks passed.');
  });

  it('returns error summary when invalid', () => {
    const result = { valid: false, errors: [{ key: 'PORT', expected: 'email', value: '3000' }] };
    const msg = summarizeTypecheck(result);
    expect(msg).toContain('1 error');
    expect(msg).toContain('PORT');
    expect(msg).toContain('email');
  });
});
