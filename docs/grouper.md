# grouper

Group environment variables by various strategies — prefix, value type, key length, or a custom function.

## API

### `groupBy(env, keyFn)`

Group env vars using a custom function. `keyFn(key, value)` should return the group name.

```js
const { groupBy } = require('./src/grouper');

const groups = groupBy(process.env, (key) =>
  key.startsWith('DB_') ? 'database' : 'app'
);
// { database: { DB_HOST: '...', ... }, app: { ... } }
```

### `groupByPrefix(env, separator = '_')`

Group by the prefix before the first separator.

```js
const { groupByPrefix } = require('./src/grouper');

const groups = groupByPrefix({ DB_HOST: 'localhost', APP_NAME: 'myapp' });
// { DB: { DB_HOST: 'localhost' }, APP: { APP_NAME: 'myapp' } }
```

Keys with no separator are placed in the `OTHER` group.

### `groupByType(env)`

Group by inferred value type: `string`, `number`, `boolean`, or `empty`.

```js
const { groupByType } = require('./src/grouper');

const groups = groupByType({ PORT: '3000', DEBUG: 'true', NAME: 'app', SECRET: '' });
// { number: { PORT: '3000' }, boolean: { DEBUG: 'true' }, string: { NAME: 'app' }, empty: { SECRET: '' } }
```

### `groupByKeyLength(env)`

Group by key length into `short` (< 8), `medium` (< 16), or `long` (>= 16) buckets.

```js
const { groupByKeyLength } = require('./src/grouper');

const groups = groupByKeyLength({ X: '1', DB_HOST: 'localhost', VERY_LONG_KEY_NAME: 'v' });
// { short: { X: '1' }, medium: { DB_HOST: 'localhost' }, long: { VERY_LONG_KEY_NAME: 'v' } }
```

### `summarizeGroups(groups)`

Returns a count of keys per group.

```js
const { groupByPrefix, summarizeGroups } = require('./src/grouper');

const groups = groupByPrefix(env);
summarizeGroups(groups);
// { DB: 3, APP: 2, OTHER: 1 }
```
