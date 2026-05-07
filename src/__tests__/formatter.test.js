const { formatLine, formatEnv, formatTable } = require('../formatter');

describe('formatLine', () => {
  it('formats a simple key-value pair', () => {
    expect(formatLine('FOO', 'bar')).toBe('FOO=bar');
  });

  it('quotes values with spaces', () => {
    expect(formatLine('FOO', 'hello world')).toBe('FOO="hello world"');
  });

  it('quotes empty values', () => {
    expect(formatLine('FOO', '')).toBe('FOO=""');
  });

  it('quotes values with hash', () => {
    expect(formatLine('FOO', 'bar#baz')).toBe('FOO="bar#baz"');
  });

  it('escapes inner double quotes', () => {
    expect(formatLine('FOO', 'say "hi"')).toBe('FOO="say \\"hi\\""');
  });
});

describe('formatEnv', () => {
  const env = { Z_KEY: 'z', A_KEY: 'a', M_KEY: 'm' };

  it('formats all keys', () => {
    const result = formatEnv(env);
    expect(result).toContain('Z_KEY=z');
    expect(result).toContain('A_KEY=a');
  });

  it('sorts keys when sorted=true', () => {
    const result = formatEnv(env, { sorted: true });
    const lines = result.split('\n');
    expect(lines[0]).toBe('A_KEY=a');
    expect(lines[1]).toBe('M_KEY=m');
    expect(lines[2]).toBe('Z_KEY=z');
  });

  it('adds comments when comments=true', () => {
    const result = formatEnv({ FOO: 'bar' }, { comments: true });
    expect(result).toContain('# FOO');
    expect(result).toContain('FOO=bar');
  });

  it('adds header when provided', () => {
    const result = formatEnv({ FOO: 'bar' }, { header: 'My Config' });
    expect(result.startsWith('# My Config')).toBe(true);
  });

  it('returns empty string for empty env', () => {
    expect(formatEnv({})).toBe('');
  });
});

describe('formatTable', () => {
  it('returns (empty) for empty env', () => {
    expect(formatTable({})).toBe('(empty)');
  });

  it('includes KEY and VALUE headers', () => {
    const result = formatTable({ FOO: 'bar' });
    expect(result).toContain('KEY');
    expect(result).toContain('VALUE');
  });

  it('includes env key and value in output', () => {
    const result = formatTable({ DATABASE_URL: 'postgres://localhost' });
    expect(result).toContain('DATABASE_URL');
    expect(result).toContain('postgres://localhost');
  });

  it('truncates long values', () => {
    const longVal = 'x'.repeat(50);
    const result = formatTable({ LONG: longVal });
    expect(result).not.toContain(longVal);
    expect(result).toContain('x'.repeat(30));
  });
});
