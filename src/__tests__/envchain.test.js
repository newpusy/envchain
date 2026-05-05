const path = require('path');
const { envchain, loadEnvChain, validateEnv } = require('../index');

// Fixtures live next to this test file
const fix = (name) => path.join(__dirname, 'fixtures', name);

beforeEach(() => {
  // Clean up any vars set by previous tests
  delete process.env.APP_NAME;
  delete process.env.PORT;
  delete process.env.SECRET;
  delete process.env.NODE_ENV;
});

describe('loadEnvChain', () => {
  test('loads a single .env file', () => {
    const env = loadEnvChain([fix('base.env')]);
    expect(env.APP_NAME).toBe('myapp');
    expect(env.PORT).toBe('3000');
  });

  test('later file overrides earlier file', () => {
    const env = loadEnvChain([fix('base.env'), fix('override.env')]);
    expect(env.PORT).toBe('8080');
    expect(env.APP_NAME).toBe('myapp');
  });

  test('skips missing files silently', () => {
    const env = loadEnvChain([fix('base.env'), fix('nonexistent.env')]);
    expect(env.APP_NAME).toBe('myapp');
  });
});

describe('validateEnv', () => {
  const mockEnv = { PORT: '3000', SECRET: 'abc123', NODE_ENV: 'production' };

  test('passes when all required vars present', () => {
    const { valid, errors } = validateEnv({ PORT: true, SECRET: true }, mockEnv);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('fails for missing variable', () => {
    const { valid, errors } = validateEnv({ MISSING_VAR: true }, mockEnv);
    expect(valid).toBe(false);
    expect(errors[0]).toMatch(/MISSING_VAR/);
  });

  test('validates against regex', () => {
    const { valid, errors } = validateEnv({ PORT: /^\d+$/ }, mockEnv);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('fails regex mismatch', () => {
    const { valid, errors } = validateEnv({ NODE_ENV: /^(dev|test)$/ }, mockEnv);
    expect(valid).toBe(false);
    expect(errors[0]).toMatch(/NODE_ENV/);
  });

  test('supports custom function validator', () => {
    const { valid } = validateEnv({ SECRET: (v) => v.length >= 6 }, mockEnv);
    expect(valid).toBe(true);
  });
});

describe('envchain (integration)', () => {
  test('loads and validates successfully', () => {
    const { env, valid, errors } = envchain(
      [fix('base.env')],
      { schema: { APP_NAME: true, PORT: /^\d+$/ } }
    );
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
    expect(env.APP_NAME).toBe('myapp');
  });

  test('throws in strict mode on validation failure', () => {
    expect(() =>
      envchain([fix('base.env')], { schema: { SECRET: true }, strict: true })
    ).toThrow(/validation failed/);
  });

  test('throws when filePaths is empty', () => {
    expect(() => envchain([])).toThrow(/non-empty array/);
  });
});
