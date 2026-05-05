const { parseEnvContent, parseLine } = require('../parser');

describe('parseLine', () => {
  it('returns null for empty lines', () => {
    expect(parseLine('')).toBeNull();
    expect(parseLine('   ')).toBeNull();
  });

  it('returns null for comment lines', () => {
    expect(parseLine('# this is a comment')).toBeNull();
    expect(parseLine('  # indented comment')).toBeNull();
  });

  it('returns null for lines without =', () => {
    expect(parseLine('NOEQUALS')).toBeNull();
  });

  it('parses a simple key=value', () => {
    expect(parseLine('FOO=bar')).toEqual({ key: 'FOO', value: 'bar' });
  });

  it('parses double-quoted values', () => {
    expect(parseLine('FOO="hello world"')).toEqual({ key: 'FOO', value: 'hello world' });
  });

  it('parses single-quoted values', () => {
    expect(parseLine("FOO='hello world'")).toEqual({ key: 'FOO', value: 'hello world' });
  });

  it('strips inline comments', () => {
    expect(parseLine('FOO=bar # some comment')).toEqual({ key: 'FOO', value: 'bar' });
  });

  it('handles values with = in them', () => {
    expect(parseLine('FOO=bar=baz')).toEqual({ key: 'FOO', value: 'bar=baz' });
  });

  it('trims key whitespace', () => {
    expect(parseLine('  FOO  =bar')).toEqual({ key: 'FOO', value: 'bar' });
  });
});

describe('parseEnvContent', () => {
  it('parses multiline env content', () => {
    const content = `
# App config
APP_NAME=envchain
PORT=3000
DEBUG=true
`;
    expect(parseEnvContent(content)).toEqual({
      APP_NAME: 'envchain',
      PORT: '3000',
      DEBUG: 'true',
    });
  });

  it('handles quoted values with spaces', () => {
    const content = 'GREETING="hello world"';
    expect(parseEnvContent(content)).toEqual({ GREETING: 'hello world' });
  });

  it('returns empty object for blank content', () => {
    expect(parseEnvContent('')).toEqual({});
    expect(parseEnvContent('# only comments\n# nothing here')).toEqual({});
  });

  it('last value wins for duplicate keys', () => {
    const content = 'KEY=first\nKEY=second';
    expect(parseEnvContent(content)).toEqual({ KEY: 'second' });
  });

  it('handles Windows-style line endings', () => {
    const content = 'FOO=bar\r\nBAZ=qux';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
