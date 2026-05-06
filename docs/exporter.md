# Exporter

The `exporter` module lets you serialize your environment variables into different output formats: **JSON**, **YAML**, and **shell scripts**.

## API

### `exportEnv(env, format, options)`

Exports an env object to the specified format.

| Param | Type | Default | Description |
|---|---|---|---|
| `env` | `Object` | — | Key-value env object |
| `format` | `string` | `'json'` | One of `json`, `yaml`, `shell` |
| `options` | `Object` | `{}` | Format-specific options |

#### Options

- `pretty` (boolean, default `false`) — pretty-print JSON output

#### Returns
`string` — serialized output

---

### `exportToJson(env, pretty?)`

Serializes env to a JSON string.

```js
const { exportToJson } = require('envchain/exporter');
exportToJson({ PORT: '3000' }, true);
// => '{\n  "PORT": "3000"\n}'
```

---

### `exportToYaml(env)`

Serializes env to a basic YAML string. Values containing special characters are automatically quoted.

```js
exportToYaml({ APP: 'myapp', URL: 'http://localhost:3000' });
// => 'APP: myapp\nURL: "http://localhost:3000"'
```

---

### `exportToShell(env)`

Serializes env to a POSIX shell script with `export` statements.

```js
exportToShell({ NAME: 'envchain' });
// => "#!/bin/sh\nexport NAME='envchain'"
```

Single quotes inside values are safely escaped.

---

## Example

```js
const { envchain } = require('envchain');
const { exportEnv } = require('envchain/exporter');

const env = envchain({ files: ['.env'] });
console.log(exportEnv(env, 'shell'));
```
