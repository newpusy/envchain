const { exportToJson, exportToYaml, exportToShell, exportEnv } = require('../exporter');

describe('exportToJson', () => {
  const env = { APP_NAME: 'envchain', PORT: '3000', DEBUG: 'false' };

  it('exports env to compact JSON', () => {
    const result = exportToJson(env);
    expect(result).toBe('{"APP_NAME":"envchain","PORT":"3000","DEBUG":"false"}');
  });

  it('exports env to pretty JSON', () => {
    const result = exportToJson(env, true);
    expect(result).toContain('\n');
    expect(JSON.parse(result)).toEqual(env);
  });

  it('throws on invalid input', () => {
    expect(() => exportToJson(null)).toThrow(TypeError);
    expect(() => exportToJson('string')).toThrow(TypeError);
  });
});

describe('exportToYaml', () => {
  it('exports simple values without quotes', () => {
    const result = exportToYaml({ APP: 'myapp', PORT: '8080' });
    expect(result).toBe('APP: myapp\nPORT: 8080');
  });

  it('quotes values with special characters', () => {
    const result = exportToYaml({ URL: 'http://example.com:3000' });
    expect(result).toContain('"');
  });

  it('throws on invalid input', () => {
    expect(() => exportToYaml(null)).toThrow(TypeError);
  });
});

describe('exportToShell', () => {
  it('exports env as shell exports', () => {
    const result = exportToShell({ NAME: 'envchain', ENV: 'test' });
    expect(result).toContain('#!/bin/sh');
    expect(result).toContain("export NAME='envchain'");
    expect(result).toContain("export ENV='test'");
  });

  it('escapes single quotes in values', () => {
    const result = exportToShell({ MSG: "it's alive" });
    expect(result).toContain("export MSG='it'\\''s alive'");
  });

  it('throws on invalid input', () => {
    expect(() => exportToShell(null)).toThrow(TypeError);
  });
});

describe('exportEnv', () => {
  const env = { KEY: 'value' };

  it('defaults to json format', () => {
    const result = exportEnv(env);
    expect(result).toBe('{"KEY":"value"}');
  });

  it('supports yaml format', () => {
    const result = exportEnv(env, 'yaml');
    expect(result).toBe('KEY: value');
  });

  it('supports shell format', () => {
    const result = exportEnv(env, 'shell');
    expect(result).toContain('#!/bin/sh');
  });

  it('throws on unsupported format', () => {
    expect(() => exportEnv(env, 'toml')).toThrow('Unsupported export format');
  });
});
