/**
 * Integration-style tests using a fixture env file to profile real-ish operations
 */
const path = require('path');
const fs = require('fs');
const { startProfile, getProfiles, clearProfiles } = require('../profiler');
const { parseEnvContent } = require('../parser');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'base.env');

function loadFixture(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

beforeEach(() => {
  clearProfiles();
});

describe('profiler with fixture files', () => {
  test('profiles a parse operation on base.env', () => {
    const content = loadFixture(FIXTURE_PATH);
    const p = startProfile('parseEnvContent');
    parseEnvContent(content);
    const entry = p.stop();

    expect(entry.name).toBe('parseEnvContent');
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
  });

  test('profile entry is stored after fixture parse', () => {
    const content = loadFixture(FIXTURE_PATH);
    startProfile('fixtureLoad').stop();
    startProfile('fixtureParse');
    parseEnvContent(content);

    const profiles = getProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(1);
    expect(profiles[0].name).toBe('fixtureLoad');
  });

  test('profiles multiple sequential parse operations', () => {
    const content = loadFixture(FIXTURE_PATH);
    for (let i = 0; i < 3; i++) {
      const p = startProfile('batchParse');
      parseEnvContent(content);
      p.stop();
    }
    const profiles = getProfiles();
    expect(profiles).toHaveLength(3);
    profiles.forEach((e) => expect(e.name).toBe('batchParse'));
  });
});
