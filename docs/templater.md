# Templater

The `templater` module lets you render environment variable values as templates, substituting `{{ KEY }}` or `${KEY}` placeholders with values from an env object.

## API

### `renderTemplate(template, env, options?)`

Replaces placeholders in a string with values from `env`.

**Options:**
- `syntax`: `'mustache'` | `'shell'` | `'both'` (default: `'both'`)
- `strict`: `boolean` — throw on missing keys (default: `false`)

```js
const { renderTemplate } = require('envchain/templater');

const env = { HOST: 'localhost', PORT: '3000' };
renderTemplate('http://{{ HOST }}:${PORT}', env);
// => 'http://localhost:3000'
```

### `extractKeys(template)`

Returns a deduplicated list of all placeholder key names found in a template string.

```js
extractKeys('{{ HOST }}:${PORT}');
// => ['HOST', 'PORT']
```

### `renderEnvTemplate(env, options?)`

Renders each string value in an env object as a template against the same env. Useful for self-referential configs.

```js
const env = {
  HOST: 'localhost',
  PORT: '8080',
  URL: 'http://{{ HOST }}:{{ PORT }}'
};
renderEnvTemplate(env);
// => { HOST: 'localhost', PORT: '8080', URL: 'http://localhost:8080' }
```

### `checkTemplate(template, env)`

Checks which placeholder keys are satisfied or missing given an env object.

```js
const { satisfied, missing } = checkTemplate('{{ HOST }}:{{ PORT }}', { HOST: 'localhost' });
// satisfied: ['HOST']
// missing:   ['PORT']
```

## Use Cases

- Compose dynamic URLs from individual env parts
- Validate that all required template variables are present before startup
- Self-referential env files where one value depends on another
