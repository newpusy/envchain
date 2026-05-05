const fs = require('fs');
const path = require('path');
const { auditEnv, auditEmitter, auditChange } = require('../auditor');
const { parseEnvContent } = require('../parser');

const fixturePath = path.join(__dirname, 'fixtures', 'audit.env');

function loadFixture(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseEnvContent(raw);
}

describe('auditor with fixture file', () => {
  let env;

  beforeEach(() => {
    env = loadFixture(fixturePath);
  });

  it('loads audit.env fixture correctly', () => {
    expect(env).toHaveProperty('AUDIT_KEY', 'hello');
    expect(env).toHaveProperty('AUDIT_SECRET', 'supersecret');
  });

  it('audits access to existing keys via proxy', () => {
    const entries = [];
    const listener = (e) => entries.push(e);
    auditEmitter.on('audit', listener);

    const proxy = auditEnv(env);
    const _ = proxy.AUDIT_KEY;
    const __ = proxy.AUDIT_SECRET;

    auditEmitter.off('audit', listener);

    expect(entries).toHaveLength(2);
    expect(entries[0].details.key).toBe('AUDIT_KEY');
    expect(entries[0].details.found).toBe(true);
    expect(entries[1].details.key).toBe('AUDIT_SECRET');
  });

  it('audits missing key with WARN level', () => {
    const entries = [];
    const listener = (e) => entries.push(e);
    auditEmitter.on('audit', listener);

    const proxy = auditEnv(env);
    const _ = proxy.NOT_IN_FILE;

    auditEmitter.off('audit', listener);

    expect(entries[0].level).toBe('WARN');
    expect(entries[0].details.found).toBe(false);
  });

  it('emits change events for each loaded key', () => {
    const entries = [];
    const listener = (e) => entries.push(e);
    auditEmitter.on('audit', listener);

    Object.keys(env).forEach((key) => auditChange(key, fixturePath));

    auditEmitter.off('audit', listener);

    expect(entries).toHaveLength(Object.keys(env).length);
    entries.forEach((e) => {
      expect(e.event).toBe('change');
      expect(e.details.source).toBe(fixturePath);
    });
  });
});
