const { maskValue, shouldMask, maskEnv } = require('../masker');

describe('maskValue', () => {
  it('masks a full value with default mask', () => {
    const result = maskValue('supersecret');
    expect(result).toBe('***cret');
  });

  it('returns only mask when value is too short', () => {
    expect(maskValue('abc')).toBe('***');
  });

  it('shows tail when showTail is true', () => {
    expect(maskValue('abcdefgh', { visibleChars: 3, showTail: true })).toBe('***fgh');
  });

  it('hides tail when showTail is false', () => {
    expect(maskValue('abcdefgh', { showTail: false })).toBe('***');
  });

  it('uses custom mask string', () => {
    expect(maskValue('abcdefgh', { mask: '####', visibleChars: 2 })).toBe('####gh');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });

  it('returns non-string values unchanged', () => {
    expect(maskValue(undefined)).toBeUndefined();
  });
});

describe('shouldMask', () => {
  it('masks keys matching default sensitive patterns', () => {
    expect(shouldMask('DB_PASSWORD')).toBe(true);
    expect(shouldMask('API_TOKEN')).toBe(true);
    expect(shouldMask('AWS_SECRET')).toBe(true);
    expect(shouldMask('PRIVATE_KEY')).toBe(true);
  });

  it('does not mask non-sensitive keys', () => {
    expect(shouldMask('APP_NAME')).toBe(false);
    expect(shouldMask('PORT')).toBe(false);
    expect(shouldMask('NODE_ENV')).toBe(false);
  });

  it('respects custom patterns', () => {
    expect(shouldMask('MY_INTERNAL_VAR', ['internal'])).toBe(true);
    expect(shouldMask('MY_INTERNAL_VAR', [/^MY_/])).toBe(true);
  });
});

describe('maskEnv', () => {
  const env = {
    APP_NAME: 'envchain',
    DB_PASSWORD: 'hunter2',
    API_TOKEN: 'tok_abc123xyz',
    PORT: '3000',
  };

  it('masks sensitive keys and leaves others intact', () => {
    const result = maskEnv(env);
    expect(result.APP_NAME).toBe('envchain');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe('***ter2');
    expect(result.API_TOKEN).toBe('***3xyz');
  });

  it('applies custom patterns', () => {
    const result = maskEnv({ PORT: '3000', MY_CUSTOM: 'value123' }, { patterns: ['custom'] });
    expect(result.MY_CUSTOM).toBe('***e123');
    expect(result.PORT).toBe('3000');
  });

  it('returns a new object without mutating input', () => {
    const input = { DB_PASSWORD: 'secret' };
    const result = maskEnv(input);
    expect(input.DB_PASSWORD).toBe('secret');
    expect(result.DB_PASSWORD).not.toBe('secret');
  });
});
