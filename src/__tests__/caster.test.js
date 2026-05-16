const { castValue, castEnv, previewCast, CAST_TYPES } = require('../caster');

describe('castValue', () => {
  test('casts to string', () => {
    expect(castValue('42', 'string')).toBe('42');
  });

  test('casts to number', () => {
    expect(castValue('3.14', 'number')).toBe(3.14);
    expect(castValue('0', 'number')).toBe(0);
  });

  test('throws on invalid number', () => {
    expect(() => castValue('abc', 'number')).toThrow(TypeError);
  });

  test.each([
    ['true', true], ['1', true], ['yes', true], ['on', true],
    ['false', false], ['0', false], ['no', false], ['off', false],
  ])('casts "%s" to boolean %s', (input, expected) => {
    expect(castValue(input, 'boolean')).toBe(expected);
  });

  test('throws on invalid boolean', () => {
    expect(() => castValue('maybe', 'boolean')).toThrow(TypeError);
  });

  test('casts valid JSON', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(castValue('[1,2,3]', 'json')).toEqual([1, 2, 3]);
  });

  test('throws on invalid JSON', () => {
    expect(() => castValue('{bad}', 'json')).toThrow(TypeError);
  });

  test('casts comma-separated string to array', () => {
    expect(castValue('a,b,c', 'array')).toEqual(['a', 'b', 'c']);
    expect(castValue('x, y , z', 'array')).toEqual(['x', 'y', 'z']);
  });

  test('throws on unknown type', () => {
    expect(() => castValue('val', 'symbol')).toThrow(TypeError);
  });
});

describe('castEnv', () => {
  const env = { PORT: '8080', DEBUG: 'true', TAGS: 'a,b', NAME: 'app', RATIO: 'bad' };
  const schema = { PORT: 'number', DEBUG: 'boolean', TAGS: 'array', RATIO: 'number' };

  test('casts matching keys', () => {
    const { result } = castEnv(env, schema);
    expect(result.PORT).toBe(8080);
    expect(result.DEBUG).toBe(true);
    expect(result.TAGS).toEqual(['a', 'b']);
  });

  test('collects errors for failed casts', () => {
    const { errors } = castEnv(env, schema);
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('RATIO');
  });

  test('leaves unscheduled keys unchanged', () => {
    const { result } = castEnv(env, schema);
    expect(result.NAME).toBe('app');
  });

  test('skips keys not present in env', () => {
    const { result, errors } = castEnv({}, { PORT: 'number' });
    expect(result).toEqual({});
    expect(errors).toHaveLength(0);
  });
});

describe('previewCast', () => {
  test('returns preview entries for matching keys', () => {
    const env = { PORT: '3000', DEBUG: 'false' };
    const schema = { PORT: 'number', DEBUG: 'boolean', MISSING: 'string' };
    const preview = previewCast(env, schema);
    expect(preview).toHaveLength(2);
    expect(preview[0]).toEqual({ key: 'PORT', from: '3000', type: 'number' });
  });
});

describe('CAST_TYPES', () => {
  test('exports supported types', () => {
    expect(CAST_TYPES).toContain('string');
    expect(CAST_TYPES).toContain('json');
  });
});
