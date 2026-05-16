# aliaser

The `aliaser` module lets you map environment variable keys to alternative names (aliases). This is useful when migrating key names, supporting multiple naming conventions, or exposing internal variables under public-facing names.

## API

### `aliasKey(env, originalKey, aliasKey)`

Adds a single alias to an env object. Both the original and alias key will be present in the returned object.

```js
const { aliasKey } = require('./aliaser');
const result = aliasKey({ DATABASE_URL: 'postgres://localhost/db' }, 'DATABASE_URL', 'DB_URL');
// { DATABASE_URL: 'postgres://localhost/db', DB_URL: 'postgres://localhost/db' }
```

### `applyAliases(env, aliasMap)`

Applies a map of `{ originalKey: aliasKey }` pairs to an env object. Original keys are preserved alongside the new aliases.

```js
const { applyAliases } = require('./aliaser');
const result = applyAliases(
  { HOST: 'localhost', PORT: '5432' },
  { HOST: 'DB_HOST', PORT: 'DB_PORT' }
);
// { HOST: 'localhost', PORT: '5432', DB_HOST: 'localhost', DB_PORT: '5432' }
```

### `replaceWithAliases(env, aliasMap)`

Same as `applyAliases`, but removes the original keys — only alias keys remain.

```js
const { replaceWithAliases } = require('./aliaser');
const result = replaceWithAliases(
  { DATABASE_URL: 'postgres://localhost/db' },
  { DATABASE_URL: 'DB_URL' }
);
// { DB_URL: 'postgres://localhost/db' }
```

### `listAliases(env, aliasMap)`

Returns an array of all resolvable alias mappings, each with `original`, `alias`, and `value` fields.

```js
const { listAliases } = require('./aliaser');
const entries = listAliases(
  { API_KEY: 'abc123' },
  { API_KEY: 'KEY', MISSING: 'NOPE' }
);
// [{ original: 'API_KEY', alias: 'KEY', value: 'abc123' }]
```

## Notes

- All functions are pure and do not mutate the input env object.
- Keys not present in the env are silently skipped.
