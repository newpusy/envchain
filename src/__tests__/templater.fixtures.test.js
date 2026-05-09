const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('../parser');
const { renderEnvTemplate, checkTemplate, extractKeys } = require('../templater');

function loadFixture(name) {
  const filePath = path.join(__dirname, 'fixtures', name);
  return fs.readFileSync(filePath, 'utf-8');
}

describe('templater fixture: template.env', () => {
  let raw;
  let env;

  beforeAll(() => {
    raw = loadFixture('template.env');
    env = parseEnvContent(raw);
  });

  it('parses template.env correctly', () => {
    expect(env.APP_NAME).toBe('envchain');
    expect(env.APP_HOST).toBe('localhost');
    expect(env.APP_PORT).toBe('4000');
  });

  it('APP_URL contains placeholders', () => {
    const keys = extractKeys(env.APP_URL);
    expect(keys).toContain('APP_HOST');
    expect(keys).toContain('APP_PORT');
    expect(keys).toContain('APP_NAME');
  });

  it('resolves APP_URL using renderEnvTemplate', () => {
    const rendered = renderEnvTemplate(env);
    expect(rendered.APP_URL).toBe('http://localhost:4000/envchain');
  });

  it('checkTemplate finds all satisfied for APP_URL', () => {
    const { satisfied, missing } = checkTemplate(env.APP_URL, env);
    expect(missing).toHaveLength(0);
    expect(satisfied).toHaveLength(3);
  });

  it('checkTemplate detects missing keys when env is partial', () => {
    const partial = { APP_NAME: 'envchain' };
    const { missing } = checkTemplate(env.APP_URL, partial);
    expect(missing).toContain('APP_HOST');
    expect(missing).toContain('APP_PORT');
  });
});
