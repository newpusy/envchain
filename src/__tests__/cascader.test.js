const { cascadeEnvs, resolveKey, summarizeCascade } = require('../cascader');

describe('cascadeEnvs', () => {
  it('returns empty result for empty layers', () => {
    expect(cascadeEnvs([])).toEqual({ result: {}, sources: {} });
  });

  it('returns single layer as-is', () => {
    const layers = [{ name: 'base', env: { PORT: '3000', HOST: 'localhost' } }];
    const { result, sources } = cascadeEnvs(layers);
    expect(result).toEqual({ PORT: '3000', HOST: 'localhost' });
    expect(sources).toEqual({ PORT: 'base', HOST: 'base' });
  });

  it('higher priority layer overrides lower', () => {
    const layers = [
      { name: 'base', env: { PORT: '3000', HOST: 'localhost' } },
      { name: 'override', env: { PORT: '8080' } }
    ];
    const { result, sources } = cascadeEnvs(layers);
    expect(result.PORT).toBe('8080');
    expect(result.HOST).toBe('localhost');
    expect(sources.PORT).toBe('override');
    expect(sources.HOST).toBe('base');
  });

  it('merges keys from all layers', () => {
    const layers = [
      { name: 'a', env: { A: '1' } },
      { name: 'b', env: { B: '2' } },
      { name: 'c', env: { C: '3' } }
    ];
    const { result } = cascadeEnvs(layers);
    expect(result).toEqual({ A: '1', B: '2', C: '3' });
  });

  it('skips invalid layers gracefully', () => {
    const layers = [
      { name: 'base', env: { PORT: '3000' } },
      { name: 'bad', env: null }
    ];
    const { result } = cascadeEnvs(layers);
    expect(result.PORT).toBe('3000');
  });
});

describe('resolveKey', () => {
  const layers = [
    { name: 'base', env: { PORT: '3000', DB: 'sqlite' } },
    { name: 'prod', env: { PORT: '443', SECRET: 'abc' } }
  ];

  it('resolves key from highest priority layer', () => {
    const { value, source } = resolveKey(layers, 'PORT');
    expect(value).toBe('443');
    expect(source).toBe('prod');
  });

  it('resolves key only in base layer', () => {
    const { value, source } = resolveKey(layers, 'DB');
    expect(value).toBe('sqlite');
    expect(source).toBe('base');
  });

  it('returns undefined for missing key', () => {
    const { value, source } = resolveKey(layers, 'MISSING');
    expect(value).toBeUndefined();
    expect(source).toBeUndefined();
  });
});

describe('summarizeCascade', () => {
  it('identifies overridden keys', () => {
    const layers = [
      { name: 'base', env: { PORT: '3000', HOST: 'localhost' } },
      { name: 'env', env: { PORT: '8080' } }
    ];
    const summary = summarizeCascade(layers);
    const portEntry = summary.find(e => e.key === 'PORT');
    expect(portEntry.finalSource).toBe('env');
    expect(portEntry.overriddenBy).toContain('env');
  });

  it('marks non-overridden keys with empty overriddenBy', () => {
    const layers = [
      { name: 'base', env: { HOST: 'localhost' } },
      { name: 'env', env: { PORT: '8080' } }
    ];
    const summary = summarizeCascade(layers);
    const hostEntry = summary.find(e => e.key === 'HOST');
    expect(hostEntry.overriddenBy).toEqual([]);
  });
});
