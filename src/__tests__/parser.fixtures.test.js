const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('../parser');

const fixturesDir = path.join(__dirname, 'fixtures');

function loadFixture(name) {
  return fs.readFileSync(path.join(fixturesDir, name), 'utf-8');
}

describe('parseEnvContent with fixture files', () => {
  it('parses quoted.env correctly', () => {
    const content = loadFixture('quoted.env');
    const result = parseEnvContent(content);

    expect(result.APP_TITLE).toBe('My Cool App');
    expect(result.SECRET_KEY).toBe('abc123xyz');
    expect(result.DATABASE_URL).toBe('postgres://user:pass@localhost/db');
    expect(result.INLINE_COMMENT).toBe('hello');
  });

  it('parses multiline.env correctly', () => {
    const content = loadFixture('multiline.env');
    const result = parseEnvContent(content);

    expect(result.FOO).toBe('bar');
    expect(result.BAR).toBe('baz');
    expect(result.EMPTY).toBe('');
    expect(result.EQUALS_IN_VALUE).toBe('key=value=extra');
    expect(result.SPACED_KEY).toBe('trimmed');
  });

  it('parses base.env correctly', () => {
    const content = loadFixture('base.env');
    const result = parseEnvContent(content);

    expect(typeof result).toBe('object');
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('parses override.env correctly', () => {
    const content = loadFixture('override.env');
    const result = parseEnvContent(content);

    expect(typeof result).toBe('object');
  });
});
