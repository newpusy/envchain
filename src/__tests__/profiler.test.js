const {
  startProfile,
  getProfiles,
  clearProfiles,
  summarizeProfiles,
} = require('../profiler');

beforeEach(() => {
  clearProfiles();
});

describe('startProfile / stop', () => {
  test('returns an entry with correct name and numeric duration', () => {
    const p = startProfile('load');
    const entry = p.stop();
    expect(entry.name).toBe('load');
    expect(typeof entry.durationMs).toBe('number');
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof entry.durationNs).toBe('number');
    expect(typeof entry.startedAt).toBe('number');
  });

  test('records entry into internal profiles list', () => {
    startProfile('parse').stop();
    expect(getProfiles()).toHaveLength(1);
  });

  test('multiple stops create multiple entries', () => {
    startProfile('merge').stop();
    startProfile('merge').stop();
    startProfile('validate').stop();
    expect(getProfiles()).toHaveLength(3);
  });

  test('stop returns the same entry that appears in getProfiles', () => {
    const entry = startProfile('check').stop();
    const profiles = getProfiles();
    expect(profiles[0]).toEqual(entry);
  });
});

describe('getProfiles', () => {
  test('returns a copy of the profiles array', () => {
    startProfile('x').stop();
    const p1 = getProfiles();
    const p2 = getProfiles();
    expect(p1).not.toBe(p2);
    expect(p1).toEqual(p2);
  });
});

describe('clearProfiles', () => {
  test('empties the profiles list', () => {
    startProfile('a').stop();
    startProfile('b').stop();
    clearProfiles();
    expect(getProfiles()).toHaveLength(0);
  });
});

describe('summarizeProfiles', () => {
  test('groups entries by name with correct stats', () => {
    startProfile('load').stop();
    startProfile('load').stop();
    startProfile('parse').stop();
    const summary = summarizeProfiles();
    expect(summary.load.count).toBe(2);
    expect(summary.parse.count).toBe(1);
    expect(typeof summary.load.totalMs).toBe('number');
    expect(typeof summary.load.avgMs).toBe('number');
  });

  test('avgMs equals totalMs divided by count', () => {
    startProfile('load').stop();
    startProfile('load').stop();
    const summary = summarizeProfiles();
    expect(summary.load.avgMs).toBeCloseTo(summary.load.totalMs / summary.load.count);
  });

  test('returns empty object when no profiles', () => {
    expect(summarizeProfiles()).toEqual({});
  });
});
