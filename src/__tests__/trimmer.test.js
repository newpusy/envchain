const { trimKey, trimValue, trimEnv, auditTrim } = require('../trimmer');

describe('trimKey', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimKey('  MY_KEY  ')).toBe('MY_KEY');
  });

  it('replaces internal whitespace with underscores', () => {
    expect(trimKey('MY  KEY')).toBe('MY__KEY');
  });

  it('returns non-string values as-is', () => {
    expect(trimKey(null)).toBeNull();
    expect(trimKey(42)).toBe(42);
  });

  it('handles already clean keys', () => {
    expect(trimKey('CLEAN_KEY')).toBe('CLEAN_KEY');
  });
});

describe('trimValue', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('preserves internal whitespace by default', () => {
    expect(trimValue('  hello   world  ')).toBe('hello   world');
  });

  it('collapses internal whitespace when option is set', () => {
    expect(trimValue('  hello   world  ', { collapseInternal: true })).toBe('hello world');
  });

  it('returns non-string values as-is', () => {
    expect(trimValue(undefined)).toBeUndefined();
  });

  it('handles empty string', () => {
    expect(trimValue('   ')).toBe('');
  });
});

describe('trimEnv', () => {
  it('trims all keys and values', () => {
    const env = { '  KEY1  ': '  value1  ', 'KEY2': '  value2' };
    expect(trimEnv(env)).toEqual({ KEY1: 'value1', KEY2: 'value2' });
  });

  it('drops empty keys after trimming', () => {
    const env = { '   ': 'some value', VALID: 'ok' };
    const result = trimEnv(env);
    expect(result).not.toHaveProperty('');
    expect(result).toHaveProperty('VALID', 'ok');
  });

  it('skips empty values when skipEmpty is true', () => {
    const env = { KEY1: '   ', KEY2: 'hello' };
    const result = trimEnv(env, { skipEmpty: true });
    expect(result).not.toHaveProperty('KEY1');
    expect(result).toHaveProperty('KEY2', 'hello');
  });

  it('collapses internal whitespace in values when option set', () => {
    const env = { KEY: '  foo   bar  ' };
    expect(trimEnv(env, { collapseInternal: true })).toEqual({ KEY: 'foo bar' });
  });

  it('returns empty object for empty input', () => {
    expect(trimEnv({})).toEqual({});
  });
});

describe('auditTrim', () => {
  it('reports keys with leading/trailing whitespace', () => {
    const env = { '  MY_KEY  ': 'value' };
    const report = auditTrim(env);
    expect(report).toContainEqual(
      expect.objectContaining({ field: 'key', original: '  MY_KEY  ', trimmed: 'MY_KEY' })
    );
  });

  it('reports values with leading/trailing whitespace', () => {
    const env = { KEY: '  hello  ' };
    const report = auditTrim(env);
    expect(report).toContainEqual(
      expect.objectContaining({ field: 'value', original: '  hello  ', trimmed: 'hello' })
    );
  });

  it('returns empty array when nothing needs trimming', () => {
    const env = { KEY1: 'value1', KEY2: 'value2' };
    expect(auditTrim(env)).toHaveLength(0);
  });

  it('reports both key and value issues for same entry', () => {
    const env = { '  KEY  ': '  val  ' };
    const report = auditTrim(env);
    expect(report).toHaveLength(2);
  });
});
