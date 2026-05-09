# freezer

Freeze and lock parsed env configs to prevent accidental runtime mutation.

## API

### `freezeEnv(env)`

Returns a frozen (immutable) shallow copy of the given env object.

```js
const { freezeEnv } = require('./src/freezer');
const env = freezeEnv({ PORT: '3000', NODE_ENV: 'production' });
// env is now frozen — attempts to mutate it will throw in strict mode
```

### `isFrozen(env)`

Returns `true` if the env object is frozen.

```js
isFrozen(env); // true
```

### `safeSet(env, key, value)`

Safely sets a key on an env object. If the env is frozen, returns a new frozen object with the key applied. If mutable, mutates in place.

```js
const updated = safeSet(env, 'DEBUG', 'true');
```

### `thawEnv(env)`

Returns a mutable shallow copy of a (possibly frozen) env object.

```js
const mutable = thawEnv(frozenEnv);
mutable.NEW_KEY = 'value'; // safe
```

### `freezeSummary(env)`

Returns a summary object with `frozen` (boolean) and `keyCount` (number).

```js
freezeSummary(env);
// { frozen: true, keyCount: 3 }
```

## Use Case

Use `freezeEnv` after loading and validating your env chain to lock down the config object and catch unintended mutations early during development.

```js
const { envchain } = require('./src/index');
const { freezeEnv } = require('./src/freezer');

const env = freezeEnv(await envchain(['.env', '.env.local']));
```
