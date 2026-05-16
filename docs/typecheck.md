# typecheck

Type-check environment variable values against a declared schema.

## Usage

```js
const { typecheckEnv, summarizeTypecheck } = require('./src/typecheck');

const env = {
  PORT: '3000',
  DEBUG: 'true',
  API_URL: 'https://api.example.com',
  EMAIL: 'admin@example.com',
};

const schema = {
  PORT: 'integer',
  DEBUG: 'boolean',
  API_URL: 'url',
  EMAIL: 'email',
};

const result = typecheckEnv(env, schema);
console.log(summarizeTypecheck(result));
// All type checks passed.
```

## Supported Types

| Type      | Description                                |
|-----------|--------------------------------------------|
| `string`  | Any string value (always passes if defined)|
| `number`  | Numeric value, including floats            |
| `integer` | Whole number, no decimal point             |
| `boolean` | `true`, `false`, `1`, `0`, `yes`, `no`     |
| `url`     | Valid URL parseable by `new URL()`         |
| `email`   | Basic email format check                   |

## API

### `checkType(value, type)`

Returns `true` if `value` satisfies the given `type`.

### `typecheckEnv(env, schema)`

- `env` — `Record<string, string>` of environment variables
- `schema` — `Record<string, string>` mapping keys to expected types

Returns `{ valid: boolean, errors: Array<{ key, expected, value }> }`.

### `summarizeTypecheck(result)`

Returns a human-readable summary string of the typecheck result.

## Integration with `envchain`

```js
const { envchain } = require('./src/index');
const { typecheckEnv } = require('./src/typecheck');

const env = envchain(['.env']);
const result = typecheckEnv(env, { PORT: 'integer', NODE_ENV: 'string' });
if (!result.valid) {
  console.error(summarizeTypecheck(result));
  process.exit(1);
}
```
