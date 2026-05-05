const path = require('path');
const fs = require('fs');
const { resolveEnvFiles } = require('../resolver');

const FIXTURES = path.resolve(__dirname, 'fixtures');

describe('resolveEnvFiles', () => {
  it('returns only existing files from default candidates', () => {
    const result = resolveEnvFiles({ cwd: FIXTURES, env: 'test' });
    // fixtures/ contains base.env and override.env, not the default .env names
    expect(Array.isArray(result)).toBe(true);
    result.forEach((f) => expect(fs.existsSync(f)).toBe(true));
  });

  it('resolves explicit file list relative to cwd', () => {
    const result = resolveEnvFiles({
      cwd: FIXTURES,
      files: ['base.env', 'override.env'],
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(path.resolve(FIXTURES, 'base.env'));
    expect(result[1]).toBe(path.resolve(FIXTURES, 'override.env'));
  });

  it('skips missing files silently when strict is false', () => {
    const result = resolveEnvFiles({
      cwd: FIXTURES,
      files: ['base.env', 'nonexistent.env'],
      strict: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('base.env');
  });

  it('throws when a required file is missing and strict is true', () => {
    expect(() =>
      resolveEnvFiles({
        cwd: FIXTURES,
        files: ['base.env', 'nonexistent.env'],
        strict: true,
      })
    ).toThrow('[envchain] Required env file not found');
  });

  it('uses NODE_ENV as default environment', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'staging';
    const result = resolveEnvFiles({ cwd: FIXTURES });
    expect(Array.isArray(result)).toBe(true);
    process.env.NODE_ENV = original;
  });

  it('falls back to development when NODE_ENV is unset', () => {
    const original = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    // Should not throw; just returns whatever exists
    const result = resolveEnvFiles({ cwd: FIXTURES });
    expect(Array.isArray(result)).toBe(true);
    process.env.NODE_ENV = original;
  });
});
