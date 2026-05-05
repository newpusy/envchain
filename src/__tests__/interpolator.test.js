const { interpolateValue, interpolateEnv } = require('../interpolator');

describe('interpolateValue', () => {
  const context = {
    HOME: '/home/user',
    APP_NAME: 'myapp',
    PORT: '3000',
  };

  it('replaces ${VAR} syntax', () => {
    expect(interpolateValue('${HOME}/config', context)).toBe('/home/user/config');
  });

  it('replaces $VAR syntax', () => {
    expect(interpolateValue('$APP_NAME-service', context)).toBe('myapp-service');
  });

  it('leaves unknown variables untouched', () => {
    expect(interpolateValue('${UNKNOWN_VAR}', context)).toBe('${UNKNOWN_VAR}');
  });

  it('handles multiple references in one value', () => {
    expect(interpolateValue('${APP_NAME}:${PORT}', context)).toBe('myapp:3000');
  });

  it('returns non-string values as-is', () => {
    expect(interpolateValue(42, context)).toBe(42);
    expect(interpolateValue(null, context)).toBe(null);
  });

  it('returns value unchanged when no references present', () => {
    expect(interpolateValue('plain-value', context)).toBe('plain-value');
  });

  it('uses empty context by default', () => {
    expect(interpolateValue('${HOME}')).toBe('${HOME}');
  });
});

describe('interpolateEnv', () => {
  it('resolves cross-references between keys', () => {
    const env = {
      BASE_URL: 'http://localhost',
      PORT: '4000',
      API_URL: '${BASE_URL}:${PORT}/api',
    };
    const result = interpolateEnv(env);
    expect(result.API_URL).toBe('http://localhost:4000/api');
  });

  it('resolves forward-declared references using original env', () => {
    const env = {
      FULL_PATH: '${DIR}/${FILE}',
      DIR: '/etc/app',
      FILE: 'config.json',
    };
    const result = interpolateEnv(env);
    expect(result.FULL_PATH).toBe('/etc/app/config.json');
  });

  it('leaves unresolvable references intact', () => {
    const env = { VALUE: '${MISSING}' };
    expect(interpolateEnv(env).VALUE).toBe('${MISSING}');
  });

  it('returns empty object for empty input', () => {
    expect(interpolateEnv({})).toEqual({});
  });

  it('does not mutate the original env object', () => {
    const env = { A: 'hello', B: '$A world' };
    const original = { ...env };
    interpolateEnv(env);
    expect(env).toEqual(original);
  });
});
