# coercer

Type coercion for environment variable string values.

## Functions

### `coerceValue(value, type)`

Coerces a single string value to the specified type.

**Supported types:** `string`, `number`, `boolean`, `json`, `array`

```js
const { coerceValue } = require('./src/coercer');

coerceValue('42', 'number');       // 42
coerceValue('true', 'boolean');    // true
coerceValue('a,b,c', 'array');     // ['a', 'b', 'c']
coerceValue('{"x":1}', 'json');    // { x: 1 }
```

Throws a `TypeError` if the value cannot be coerced to the requested type.

---

### `coerceEnv(env, schema)`

Coerces an entire env object using a schema map of `{ KEY: type }`.

Returns `{ result, errors }` — never throws. Errors are collected per key.

```js
const { coerceEnv } = require('./src/coercer');

const env = { PORT: '8080', DEBUG: 'false', TAGS: 'a,b' };
const schema = { PORT: 'number', DEBUG: 'boolean', TAGS: 'array' };

const { result, errors } = coerceEnv(env, schema);
// result.PORT  => 8080
// result.DEBUG => false
// result.TAGS  => ['a', 'b']
// errors       => []
```

---

### `inferType(value)`

Infers a likely type from a raw string value. Useful for auto-schema generation.

```js
const { inferType } = require('./src/coercer');

inferType('true');     // 'boolean'
inferType('3.14');     // 'number'
inferType('a,b');      // 'array'
inferType('{"k":1}'); // 'json'
inferType('hello');    // 'string'
```

## Boolean truthy/falsy values

| Truthy | Falsy |
|--------|-------|
| `true` | `false` |
| `1`    | `0`     |
| `yes`  | `no`    |
| `on`   | `off`   |
