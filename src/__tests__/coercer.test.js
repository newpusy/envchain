const { coerceValue, coerceEnv, inferType } = require('../coercer');

describe('coerceValue', () => {
  it('coerces to number', () => {
    expect(coerceValue('42', 'number')).toBe(42);
    expect(coerceValue('3.14', 'number')).toBeCloseTo(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => coerceValue('abc', 'number')).toThrow(TypeError);
  });

  it('coerces truthy booleans', () => {
    for (const v of ['true', '1', 'yes', 'on']) {
      expect(coerceValue(v, 'boolean')).toBe(true);
    }
  });

  it('coerces falsy booleans', () => {
    for (const v of ['false', '0', 'no', 'off']) {
      expect(coerceValue(v, 'boolean')).toBe(false);
    }
  });

  it('throws on invalid boolean', () => {
    expect(() => coerceValue('maybe', 'boolean')).toThrow(TypeError);
  });

  it('coerces to JSON', () => {
    expect(coerceValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(coerceValue('[1,2]', 'json')).toEqual([1, 2]);
  });

  it('throws on invalid JSON', () => {
    expect(() => coerceValue('{bad}', 'json')).toThrow(TypeError);
  });

  it('coerces to array', () => {
    expect(coerceValue('a,b,c', 'array')).toEqual(['a', 'b', 'c']);
    expect(coerceValue('x, y , z', 'array')).toEqual(['x', 'y', 'z']);
  });

  it('returns string by default', () => {
    expect(coerceValue('hello', 'string')).toBe('hello');
    expect(coerceValue('hello')).toBe('hello');
  });

  it('passes through null/undefined', () => {
    expect(coerceValue(null, 'number')).toBeNull();
    expect(coerceValue(undefined, 'boolean')).toBeUndefined();
  });
});

describe('coerceEnv', () => {
  it('coerces matching keys by schema', () => {
    const env = { PORT: '3000', DEBUG: 'true', NAME: 'app' };
    const schema = { PORT: 'number', DEBUG: 'boolean' };
    const { result, errors } = coerceEnv(env, schema);
    expect(result.PORT).toBe(3000);
    expect(result.DEBUG).toBe(true);
    expect(result.NAME).toBe('app');
    expect(errors).toHaveLength(0);
  });

  it('collects errors without throwing', () => {
    const env = { PORT: 'not-a-number' };
    const { errors } = coerceEnv(env, { PORT: 'number' });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/PORT/);
  });

  it('skips keys not present in env', () => {
    const { result } = coerceEnv({}, { MISSING: 'number' });
    expect(result).toEqual({});
  });
});

describe('inferType', () => {
  it('infers boolean', () => expect(inferType('true')).toBe('boolean'));
  it('infers number', () => expect(inferType('42')).toBe('number'));
  it('infers json', () => expect(inferType('{"x":1}')).toBe('json'));
  it('infers array', () => expect(inferType('a,b,c')).toBe('array'));
  it('infers string', () => expect(inferType('hello world')).toBe('string'));
});
