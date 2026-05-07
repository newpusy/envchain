# Comparator

The `comparator` module provides structured, key-level comparison between two env objects. It is useful for auditing configuration drift between environments or deployment stages.

## API

### `compareKey(key, envA, envB)`

Compares a single key across two env objects.

Returns an object with:
- `key` — the env key
- `status` — one of `'equal'`, `'changed'`, `'added'`, `'removed'`
- `valueA` — value from `envA` (or `undefined`)
- `valueB` — value from `envB` (or `undefined`)

### `compareEnvs(envA, envB)`

Compares all keys across two env objects. Returns a sorted array of comparison result objects (one per unique key).

```js
const { compareEnvs } = require('./comparator');

const results = compareEnvs(
  { HOST: 'localhost', PORT: '3000' },
  { HOST: 'example.com', PORT: '3000', LOG: 'info' }
);
// [
//   { key: 'HOST', status: 'changed', valueA: 'localhost', valueB: 'example.com' },
//   { key: 'LOG',  status: 'added',   valueA: undefined,   valueB: 'info' },
//   { key: 'PORT', status: 'equal',   valueA: '3000',      valueB: '3000' },
// ]
```

### `filterByStatus(results, status)`

Filters a comparison result array by status string.

```js
const changed = filterByStatus(results, 'changed');
```

### `summarizeComparison(results)`

Returns a summary object with counts for each status and a `total`.

```js
const summary = summarizeComparison(results);
// { total: 3, equal: 1, changed: 1, added: 1, removed: 0 }
```

## Use Cases

- Detect configuration drift between staging and production
- Validate that a deployment only changed expected keys
- Generate human-readable change reports for env updates
