# masker

The `masker` module provides utilities to mask sensitive environment variable values before display, logging, or export.

## Functions

### `maskValue(value, options?)`

Masks a string value, optionally revealing the last N characters.

**Options:**
| Option | Type | Default | Description |
|---|---|---|---|
| `mask` | `string` | `'***'` | The mask string to prepend |
| `visibleChars` | `number` | `4` | Number of trailing characters to show |
| `showTail` | `boolean` | `true` | Whether to show the tail of the value |

```js
const { maskValue } = require('./masker');

maskValue('supersecret');             // '***cret'
maskValue('supersecret', { showTail: false }); // '***'
maskValue('supersecret', { visibleChars: 2 }); // '***et'
```

### `shouldMask(key, patterns?)`

Returns `true` if a key matches any sensitive pattern (built-in or custom).

Built-in patterns match: `secret`, `password`, `passwd`, `token`, `api_key`, `private`, `credential`.

```js
const { shouldMask } = require('./masker');

shouldMask('DB_PASSWORD');           // true
shouldMask('PORT');                  // false
shouldMask('MY_VAR', ['my_var']);    // true
```

### `maskEnv(env, options?)`

Masks all sensitive values in an env object. Returns a new object.

**Options:**
| Option | Type | Description |
|---|---|---|
| `patterns` | `string[] \| RegExp[]` | Additional key patterns to mask |
| `maskOptions` | `object` | Options passed to `maskValue` |

```js
const { maskEnv } = require('./masker');

const env = {
  APP_NAME: 'myapp',
  DB_PASSWORD: 'hunter2',
  API_TOKEN: 'tok_abc123',
};

const masked = maskEnv(env);
// { APP_NAME: 'myapp', DB_PASSWORD: '***ter2', API_TOKEN: '***b123' }
```

## Use Cases

- Safe logging of environment configs
- Redacting secrets before export or display
- Combining with `redactor.js` for full sensitive data protection
