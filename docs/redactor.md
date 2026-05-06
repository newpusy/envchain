# Redactor

The `redactor` module provides utilities to safely redact sensitive environment variable values before logging, displaying, or transmitting env configs.

## Usage

```js
const { redactEnv, redactValue, isSensitiveKey } = require('./src/redactor');

const env = {
  APP_ENV: 'production',
  DB_PASSWORD: 'supersecret',
  ACCESS_TOKEN: 'abc123',
  PORT: '3000',
};

const safe = redactEnv(env);
console.log(safe);
// {
//   APP_ENV: 'production',
//   DB_PASSWORD: '[REDACTED]',
//   ACCESS_TOKEN: '[REDACTED]',
//   PORT: '3000'
// }
```

## API

### `isSensitiveKey(key, patterns?)`

Returns `true` if the key matches any of the sensitive patterns.

- `key` — the env variable name
- `patterns` — optional array of `RegExp` (defaults to built-in patterns)

### `redactValue(key, value, options?)`

Returns the redacted string if the key is sensitive, otherwise returns the original value.

**Options:**
- `patterns` — custom `RegExp[]` to match sensitive keys
- `redactWith` — string to replace sensitive values with (default: `'[REDACTED]'`)

### `redactEnv(env, options?)`

Returns a new object with all sensitive values replaced. Does not mutate the input.

**Options:** same as `redactValue`.

## Default Sensitive Patterns

The following key patterns are considered sensitive by default:

- `password`, `passwd`
- `secret`
- `token`
- `api_key`, `apikey`
- `private_key`
- `auth`
- `credential`
