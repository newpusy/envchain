const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('../parser');
const { freezeEnv, isFrozen, thawEnv } = require('../freezer');

function loadFixture(name) {
  const filePath = path.join(__dirname, 'fixtures', name);
  return fs.readFileSync(filePath, 'utf-8');
}

describe('freezer fixture: freeze.env', () => {
  let env;

  beforeEach(() => {
    const content = loadFixture('freeze.env');
    env = parseEnvContent(content);
  });

  it('parses the fixture without errors', () => {
    expect(typeof env).toBe('object');
    expect(Object.keys(env).length).toBeGreaterThan(0);
  });

  it('can freeze the parsed env', () => {
    const frozen = freezeEnv(env);
    expect(isFrozen(frozen)).toBe(true);
  });

  it('frozen env throws on direct mutation attempt', () => {
    const frozen = freezeEnv(env);
    expect(() => {
      'use strict';
      frozen.NEW_KEY = 'oops';
    }).toThrow();
  });

  it('thawed env allows mutation', () => {
    const frozen = freezeEnv(env);
    const thawed = thawEnv(frozen);
    expect(() => {
      thawed.NEW_KEY = 'ok';
    }).not.toThrow();
    expect(thawed.NEW_KEY).toBe('ok');
  });

  it('thaw does not affect the frozen original', () => {
    const frozen = freezeEnv(env);
    const thawed = thawEnv(frozen);
    thawed.EXTRA = 'added';
    expect(frozen.EXTRA).toBeUndefined();
  });
});
