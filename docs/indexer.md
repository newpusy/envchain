# Indexer

The `indexer` module builds searchable indexes over environment variable key/value pairs, enabling fast lookups and search operations.

## Functions

### `buildValueIndex(env)`

Builds a reverse lookup index mapping values to the keys that hold them.

```js
const { buildValueIndex } = require('./src/indexer');
const index = buildValueIndex({ A: 'foo', B: 'foo', C: 'bar' });
// { foo: ['A', 'B'], bar: ['C'] }
```

### `buildPrefixIndex(env, separator = '_')`

Groups keys by their first prefix segment.

```js
const index = buildPrefixIndex({ APP_NAME: 'x', APP_ENV: 'y', DB_HOST: 'z' });
// { APP: ['APP_NAME', 'APP_ENV'], DB: ['DB_HOST'] }
```

### `searchKeys(env, query)`

Returns all keys that contain the query string (case-insensitive).

```js
const keys = searchKeys(env, 'db');
// ['DB_HOST', 'DB_PORT']
```

### `searchValues(env, query)`

Returns key/value pairs where the value contains the query string.

```js
const matches = searchValues(env, 'local');
// { DB_HOST: 'localhost' }
```

### `summarizeIndex(env)`

Returns a summary of index statistics.

```js
const summary = summarizeIndex(env);
// {
//   totalKeys: 4,
//   uniqueValues: 4,
//   prefixes: 2,
//   prefixBreakdown: { APP: 2, DB: 2 }
// }
```

## Use Case

Useful for debugging large `.env` configurations, detecting duplicate values, or building CLI search tooling on top of envchain.
