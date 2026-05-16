# caster

Explicitly cast environment variable values to specific JavaScript types.

Unlike `coercer` (which infers types automatically), `caster` requires you to
declare exactly what type each key should become — giving you full control.

## API

### `castValue(value, type)`

Cast a single string value to the given type.

| Type | Description |
|------|-------------|
| `'string'` | No-op, returns the value as-is |
| `'number'` | Parses float; throws if `NaN` |
| `'boolean'` | Accepts `true/false/1/0/yes/no/on/off` |
| `'json'` | `JSON.parse`; throws on invalid JSON |
| `'array'` | Splits on commas, trims whitespace |

```js
const { castValue } = require('./caster');

castValue('8080', 'number');   // 8080
castValue('true', 'boolean');  // true
castValue('a,b,c', 'array');   // ['a', 'b', 'c']
```

### `castEnv(env, schema)`

Cast multiple keys at once using a schema map.

```js
const { castEnv } = require('./caster');

const env = { PORT: '3000', DEBUG: 'false', TAGS: 'web,api' };
const schema = { PORT: 'number', DEBUG: 'boolean', TAGS: 'array' };

const { result, errors } = castEnv(env, schema);
// result.PORT  => 3000
// result.DEBUG => false
// result.TAGS  => ['web', 'api']
// errors       => [] (empty if all succeeded)
```

Keys not present in the schema are passed through unchanged.  
Keys that fail casting are collected in `errors` — the original value is kept.

### `previewCast(env, schema)`

Returns a list of `{ key, from, type }` objects showing what *would* be cast,
without actually performing the cast. Useful for dry-run logging.

```js
const preview = previewCast(env, schema);
// [{ key: 'PORT', from: '3000', type: 'number' }, ...]
```

## Differences from `coercer`

| | `coercer` | `caster` |
|---|---|---|
| Type detection | Automatic (inferred) | Explicit (schema) |
| Control | Low | High |
| Error handling | Silent coercion | Collects errors |
