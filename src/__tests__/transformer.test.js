const { transformEnv, TRANSFORMERS } = require('../transformer');

describe('TRANSFORMERS', () => {
  test('string casts value to string', () => {
    expect(TRANSFORMERS.string(42)).toBe('42');
  });

  test('number casts a numeric string', () => {
    expect(TRANSFORMERS.number('3.14')).toBe(3.14);
  });

  test('number throws on non-numeric string', () => {
    expect(() => TRANSFORMERS.number('abc')).toThrow(TypeError);
  });

  test('boolean casts "true" to true', () => {
    expect(TRANSFORMERS.boolean('true')).toBe(true);
    expect(TRANSFORMERS.boolean('1')).toBe(true);
    expect(TRANSFORMERS.boolean('yes')).toBe(true);
  });

  test('boolean casts "false" to false', () => {
    expect(TRANSFORMERS.boolean('false')).toBe(false);
    expect(TRANSFORMERS.boolean('0')).toBe(false);
    expect(TRANSFORMERS.boolean('no')).toBe(false);
  });

  test('boolean throws on unrecognised value', () => {
    expect(() => TRANSFORMERS.boolean('maybe')).toThrow(TypeError);
  });

  test('json parses a valid JSON string', () => {
    expect(TRANSFORMERS.json('{"a":1}')).toEqual({ a: 1 });
  });

  test('json throws on invalid JSON', () => {
    expect(() => TRANSFORMERS.json('not-json')).toThrow(TypeError);
  });
});

describe('transformEnv', () => {
  const rawEnv = {
    PORT: '8080',
    DEBUG: 'true',
    APP_NAME: 'envchain',
  };

  test('returns env unchanged when no schema provided', () => {
    expect(transformEnv(rawEnv)).toEqual(rawEnv);
  });

  test('casts PORT to number via schema', () => {
    const result = transformEnv(rawEnv, { PORT: { type: 'number' } });
    expect(result.PORT).toBe(8080);
  });

  test('casts DEBUG to boolean via schema', () => {
    const result = transformEnv(rawEnv, { DEBUG: { type: 'boolean' } });
    expect(result.DEBUG).toBe(true);
  });

  test('applies default value for missing key', () => {
    const result = transformEnv(rawEnv, { TIMEOUT: { type: 'number', default: 30 } });
    expect(result.TIMEOUT).toBe(30);
  });

  test('applies default when value is empty string', () => {
    const result = transformEnv({ ...rawEnv, RETRIES: '' }, { RETRIES: { default: 3 } });
    expect(result.RETRIES).toBe(3);
  });

  test('throws on unknown transformer type', () => {
    expect(() => transformEnv(rawEnv, { PORT: { type: 'date' } })).toThrow(
      'Unknown transformer type: "date"'
    );
  });

  test('does not mutate the original env object', () => {
    const original = { PORT: '9000' };
    transformEnv(original, { PORT: { type: 'number' } });
    expect(original.PORT).toBe('9000');
  });
});
