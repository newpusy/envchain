const {
  auditEmitter,
  createAuditEntry,
  auditAccess,
  auditChange,
  auditValidationFailure,
  auditEnv,
} = require('../auditor');

describe('createAuditEntry', () => {
  it('creates an entry with timestamp, level, event, and details', () => {
    const entry = createAuditEntry('test_event', { key: 'FOO' }, 'info');
    expect(entry.event).toBe('test_event');
    expect(entry.level).toBe('INFO');
    expect(entry.details).toEqual({ key: 'FOO' });
    expect(entry.timestamp).toBeDefined();
  });

  it('defaults to INFO level for unknown levels', () => {
    const entry = createAuditEntry('test', {}, 'unknown');
    expect(entry.level).toBe('INFO');
  });
});

describe('auditAccess', () => {
  it('returns INFO entry when key is found', () => {
    const entry = auditAccess('DB_HOST', true);
    expect(entry.level).toBe('INFO');
    expect(entry.event).toBe('access');
    expect(entry.details.key).toBe('DB_HOST');
    expect(entry.details.found).toBe(true);
  });

  it('returns WARN entry when key is not found', () => {
    const entry = auditAccess('MISSING_KEY', false);
    expect(entry.level).toBe('WARN');
    expect(entry.details.found).toBe(false);
  });

  it('emits audit event', () => {
    const listener = jest.fn();
    auditEmitter.once('audit', listener);
    auditAccess('FOO', true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('auditChange', () => {
  it('returns entry with key and source', () => {
    const entry = auditChange('API_KEY', '.env.production');
    expect(entry.event).toBe('change');
    expect(entry.details.key).toBe('API_KEY');
    expect(entry.details.source).toBe('.env.production');
  });
});

describe('auditValidationFailure', () => {
  it('returns ERROR entry with reason', () => {
    const entry = auditValidationFailure('PORT', 'must be a number');
    expect(entry.level).toBe('ERROR');
    expect(entry.event).toBe('validation_failure');
    expect(entry.details.reason).toBe('must be a number');
  });
});

describe('auditEnv', () => {
  it('returns value for existing key and audits access', () => {
    const listener = jest.fn();
    auditEmitter.once('audit', listener);
    const proxy = auditEnv({ PORT: '3000' });
    expect(proxy.PORT).toBe('3000');
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ event: 'access', details: expect.objectContaining({ found: true }) }));
  });

  it('audits missing key access as not found', () => {
    const listener = jest.fn();
    auditEmitter.once('audit', listener);
    const proxy = auditEnv({ PORT: '3000' });
    const _ = proxy.MISSING;
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ details: expect.objectContaining({ found: false }) }));
  });

  it('does not audit internal keys like then', () => {
    const listener = jest.fn();
    auditEmitter.once('audit', listener);
    const proxy = auditEnv({});
    const _ = proxy.then;
    expect(listener).not.toHaveBeenCalled();
  });
});
