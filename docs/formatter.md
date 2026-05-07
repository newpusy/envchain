# Formatter

The `formatter` module provides utilities to format environment variable objects into human-readable or machine-readable output styles.

## API

### `formatLine(key, value)`

Formats a single key-value pair as a dotenv-style line.

- Automatically quotes values that contain spaces, `#`, `=`, or are empty.
- Escapes inner double quotes.

```js
const { formatLine } = require('envchain/formatter');

formatLine('FOO', 'bar');          // => 'FOO=bar'
formatLine('FOO', 'hello world'); // => 'FOO="hello world"'
formatLine('FOO', '');            // => 'FOO=""'
```

---

### `formatEnv(env, options?)`

Formats an entire env object into a dotenv-style string.

**Options:**

| Option     | Type    | Default | Description                          |
|------------|---------|---------|--------------------------------------|
| `sorted`   | boolean | `false` | Sort keys alphabetically             |
| `comments` | boolean | `false` | Add a comment line above each key    |
| `header`   | string  | —       | Add a header comment at the top      |

```js
const { formatEnv } = require('envchain/formatter');

const env = { FOO: 'bar', BAZ: 'qux' };

formatEnv(env, { sorted: true, header: 'My App Config' });
// # My App Config
//
// BAZ=qux
// FOO=bar
```

---

### `formatTable(env)`

Formats an env object as a readable table string, suitable for console output.

Values longer than 30 characters are truncated.

```js
const { formatTable } = require('envchain/formatter');

console.log(formatTable({ APP_NAME: 'envchain', PORT: '3000' }));
// KEY          | VALUE
// -------------+--------------------------------
// APP_NAME     | envchain
// PORT         | 3000
```

---

## Use Cases

- Generating `.env` files programmatically
- Displaying env configs in CLI tools
- Producing sorted, commented config templates
