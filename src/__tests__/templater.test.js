const { renderTemplate, extractKeys, renderEnvTemplate, checkTemplate } = require('../templater');

describe('renderTemplate', () => {
  const env = { NAME: 'world', PORT: '3000' };

  it('replaces mustache-style placeholders', () => {
    expect(renderTemplate('Hello {{ NAME }}!', env)).toBe('Hello world!');
  });

  it('replaces shell-style placeholders', () => {
    expect(renderTemplate('Port is ${PORT}', env)).toBe('Port is 3000');
  });

  it('replaces both styles by default', () => {
    expect(renderTemplate('{{ NAME }} on ${PORT}', env)).toBe('world on 3000');
  });

  it('leaves unknown keys untouched when not strict', () => {
    expect(renderTemplate('Hello {{ MISSING }}', env)).toBe('Hello {{ MISSING }}');
  });

  it('throws in strict mode for missing keys', () => {
    expect(() => renderTemplate('{{ MISSING }}', env, { strict: true })).toThrow('Missing template variable: MISSING');
  });

  it('only replaces mustache when syntax is mustache', () => {
    const result = renderTemplate('{{ NAME }} ${PORT}', env, { syntax: 'mustache' });
    expect(result).toBe('world ${PORT}');
  });

  it('only replaces shell when syntax is shell', () => {
    const result = renderTemplate('{{ NAME }} ${PORT}', env, { syntax: 'shell' });
    expect(result).toBe('{{ NAME }} 3000');
  });
});

describe('extractKeys', () => {
  it('extracts mustache keys', () => {
    expect(extractKeys('Hello {{ NAME }} from {{ CITY }}')).toEqual(['NAME', 'CITY']);
  });

  it('extracts shell keys', () => {
    expect(extractKeys('${HOST}:${PORT}')).toEqual(['HOST', 'PORT']);
  });

  it('deduplicates keys', () => {
    expect(extractKeys('{{ KEY }} ${KEY}')).toEqual(['KEY']);
  });

  it('returns empty array for no placeholders', () => {
    expect(extractKeys('no placeholders here')).toEqual([]);
  });
});

describe('renderEnvTemplate', () => {
  it('renders env values that reference other env keys', () => {
    const env = { HOST: 'localhost', PORT: '8080', URL: 'http://{{ HOST }}:{{ PORT }}' };
    const result = renderEnvTemplate(env);
    expect(result.URL).toBe('http://localhost:8080');
  });

  it('leaves non-string values unchanged', () => {
    const env = { COUNT: 42, LABEL: '{{ COUNT }}' };
    const result = renderEnvTemplate(env);
    expect(result.COUNT).toBe(42);
  });
});

describe('checkTemplate', () => {
  it('returns satisfied and missing keys', () => {
    const env = { NAME: 'Alice' };
    const result = checkTemplate('Hello {{ NAME }}, your port is ${PORT}', env);
    expect(result.satisfied).toEqual(['NAME']);
    expect(result.missing).toEqual(['PORT']);
  });

  it('all satisfied when env has all keys', () => {
    const env = { A: '1', B: '2' };
    const result = checkTemplate('{{ A }} ${B}', env);
    expect(result.missing).toHaveLength(0);
  });
});
