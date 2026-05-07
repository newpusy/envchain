# Scoper

The `scoper` module lets you work with namespaced environment variables by grouping, extracting, and restoring variables based on a prefix scope.

## API

### `scopeEnv(env, scope, options?)`

Extracts all variables whose keys start with `<scope>_`.

```js
const { scopeEnv } = require('./src/scoper');

const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
const db = scopeEnv(env, 'DB');
// => { HOST: 'localhost', PORT: '5432' }
```

**Options:**
- `stripPrefix` (boolean, default `true`) — strip the scope prefix from result keys

---

### `listScopes(env)`

Returns a sorted array of all unique top-level scope prefixes found in the env object.

```js
const { listScopes } = require('./src/scoper');

listScopes({ DB_HOST: 'x', REDIS_PORT: '6379', PORT: '3000' });
// => ['DB', 'REDIS']
```

---

### `groupByScope(env, stripPrefix?)`

Groups all env variables by their scope prefix. Unscoped keys (no `_` in name) are placed under the special `__root__` key.

```js
const { groupByScope } = require('./src/scoper');

groupByScope({ DB_HOST: 'localhost', PORT: '3000' });
// => { DB: { HOST: 'localhost' }, __root__: { PORT: '3000' } }
```

---

### `unscopeEnv(scopedEnv, scope)`

Restores a flat env from a scoped object by re-adding the prefix.

```js
const { unscopeEnv } = require('./src/scoper');

unscopeEnv({ HOST: 'localhost', PORT: '5432' }, 'DB');
// => { DB_HOST: 'localhost', DB_PORT: '5432' }
```

---

## Use Case

Useful when passing a subset of env variables to a specific service or module, without exposing the full environment.
