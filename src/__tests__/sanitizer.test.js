const { sanitizeKey, sanitizeValue, sanitizeEnv } = require('../sanitizer');

describe('sanitizeKey', () => {
  it('trims whitespace and uppercases the key', () => {
    expect(sanitizeKey('  api_key  ')).toBe('API_KEY');
  });

  it('accepts valid keys with underscores and numbers', () => {
    expect(sanitizeKey('db_host_1')).toBe('DB_HOST_1');
  });

  it('accepts keys starting with underscore', () => {
    expect(sanitizeKey('_private')).toBe('_PRIVATE');
  });

  it('throws on non-string input', () => {
    expect(() => sanitizeKey(42)).toThrow(TypeError);
  });

  it('throws on empty string', () => {
    expect(() => sanitizeKey('   ')).toThrow('Env key cannot be empty');
  });

  it('throws on keys starting with a digit', () => {
    expect(() => sanitizeKey('1BAD_KEY')).toThrow('Invalid env key');
  });

  it('throws on keys with invalid characters', () => {
    expect(() => sanitizeKey('BAD-KEY')).toThrow('Invalid env key');
  });
});

describe('sanitizeValue', () => {
  it('returns empty string for null', () => {
    expect(sanitizeValue(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(sanitizeValue(undefined)).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeValue('  hello world  ')).toBe('hello world');
  });

  it('removes null bytes', () => {
    expect(sanitizeValue('val\0ue')).toBe('value');
  });

  it('coerces non-string values to string', () => {
    expect(sanitizeValue(123)).toBe('123');
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all keys and values', () => {
    const result = sanitizeEnv({ ' db_host ': '  localhost  ', port: '5432' });
    expect(result).toEqual({ DB_HOST: 'localhost', PORT: '5432' });
  });

  it('skips invalid keys in non-strict mode', () => {
    const result = sanitizeEnv({ 'bad-key': 'value', good_key: 'ok' });
    expect(result).toEqual({ GOOD_KEY: 'ok' });
  });

  it('throws on invalid keys in strict mode', () => {
    expect(() =>
      sanitizeEnv({ 'bad-key': 'value' }, { strict: true })
    ).toThrow('Invalid env key');
  });

  it('returns empty object for empty input', () => {
    expect(sanitizeEnv({})).toEqual({});
  });
});
