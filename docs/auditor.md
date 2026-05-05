# Auditor

The `auditor` module provides lightweight audit logging for environment variable access and mutations within `envchain`.

## Features

- Track every read of an env variable via a `Proxy`
- Log changes when env files are loaded or overridden
- Emit structured audit entries via an `EventEmitter`
- Flag validation failures with `ERROR` level entries

## Usage

```js
const { auditEnv, auditEmitter } = require('./src/auditor');

// Listen to all audit events
auditEmitter.on('audit', (entry) => {
  console.log(`[${entry.level}] ${entry.event}`, entry.details);
});

// Wrap your resolved env object
const env = auditEnv({ PORT: '3000', DB_HOST: 'localhost' });

// Access is automatically audited
console.log(env.PORT);       // emits INFO access event
console.log(env.MISSING);    // emits WARN access event (not found)
```

## API

### `createAuditEntry(event, details, level)`
Creates a raw audit entry object with a timestamp.

### `auditAccess(key, found)`
Audits a read of `key`. Emits `WARN` if not found, `INFO` otherwise.

### `auditChange(key, source)`
Audits a change to `key` from the given source file.

### `auditValidationFailure(key, reason)`
Audits a validation failure for `key` with a descriptive reason.

### `auditEnv(env)`
Wraps an env object in a `Proxy` that automatically calls `auditAccess` on every property read.

## Audit Entry Shape

```json
{
  "timestamp": "2024-01-15T10:23:00.000Z",
  "level": "INFO",
  "event": "access",
  "details": { "key": "PORT", "found": true }
}
```

## Log Levels

| Level | When |
|-------|------|
| `INFO` | Successful access or change |
| `WARN` | Missing key access |
| `ERROR` | Validation failure |
