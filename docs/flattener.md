# flattener

The `flattener` module converts nested JavaScript objects into flat `KEY=VALUE` env maps and back again, using a configurable separator (default `__`).

## Functions

### `flattenObject(obj, prefix?, separator?)`

Recursively flattens a nested object into uppercase, separator-delimited env keys.

```js
const { flattenObject } = require('./src/flattener');

flattenObject({ db: { host: 'localhost', port: 5432 } });
// => { DB__HOST: 'localhost', DB__PORT: '5432' }
```

- Arrays are serialized as JSON strings.
- All keys are uppercased.
- Default separator is `__`.

### `flattenEnv(env, separator?)`

Alias for `flattenObject` with no prefix — intended for plain env-like dicts.

```js
const { flattenEnv } = require('./src/flattener');

flattenEnv({ app: { debug: true } });
// => { APP__DEBUG: 'true' }
```

### `expandEnv(env, separator?)`

Expands a flat env map back into a nested object. Keys are lowercased during expansion.

```js
const { expandEnv } = require('./src/flattener');

expandEnv({ DB__HOST: 'localhost', DB__PORT: '5432' });
// => { db: { host: 'localhost', port: '5432' } }
```

## Round-trip example

```js
const { flattenEnv, expandEnv } = require('./src/flattener');

const nested = { db: { host: 'localhost' }, app: { port: '3000' } };
const flat = flattenEnv(nested);
const restored = expandEnv(flat);
// restored deep-equals nested
```

## Options

| Parameter   | Default | Description                        |
|-------------|---------|------------------------------------|
| `prefix`    | `''`    | Optional key prefix for flattening |
| `separator` | `'__'`  | Delimiter between key segments     |
