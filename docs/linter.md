# linter

The `linter` module checks environment variable keys and values for common formatting and naming issues.

## API

### `lintKey(key)`

Lints a single environment variable key against naming conventions.

- Keys should match `[A-Z][A-Z0-9_]*`
- Keys should not start or end with `_`
- Keys should not contain double underscores

**Returns:** `{ key: string, issues: string[] }`

```js
const { lintKey } = require('./linter');

lintKey('DATABASE_URL'); // { key: 'DATABASE_URL', issues: [] }
lintKey('bad_key');      // { key: 'bad_key', issues: ['key "bad_key" does not match recommended pattern ...'] }
```

### `lintValue(key, value)`

Lints the value associated with a key for suspicious content.

Checks for:
- Leading or trailing whitespace
- Multiple consecutive spaces
- Control characters

**Returns:** `{ key: string, issues: string[] }`

```js
const { lintValue } = require('./linter');

lintValue('HOST', 'localhost');   // { key: 'HOST', issues: [] }
lintValue('HOST', ' localhost');  // { key: 'HOST', issues: ['value for "HOST": value has leading or trailing whitespace'] }
```

### `lintEnv(env)`

Lints an entire environment object and returns a summary.

**Returns:** `{ valid: boolean, results: Array<{ key: string, issues: string[] }> }`

```js
const { lintEnv } = require('./linter');

const result = lintEnv({
  PORT: '3000',
  bad_key: ' oops ',
});

// result.valid === false
// result.results contains entries for bad_key
```

## Integration

Use `lintEnv` after loading and merging your env files to catch issues early:

```js
const { loadEnvChain } = require('./loader');
const { lintEnv } = require('./linter');

const env = loadEnvChain(['.env', '.env.local']);
const { valid, results } = lintEnv(env);

if (!valid) {
  results.forEach(({ key, issues }) => {
    issues.forEach(issue => console.warn(`[lint] ${issue}`));
  });
}
```
