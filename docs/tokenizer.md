# tokenizer

Tokenize environment variable keys into structured segments for analysis and grouping.

## Overview

The tokenizer splits env keys by a delimiter (default: `_`) and attaches metadata such as depth, prefix, and base segment.

## API

### `tokenizeKey(key, delimiter?)`

Tokenize a single key string.

```js
const { tokenizeKey } = require('./src/tokenizer');

tokenizeKey('DB_PRIMARY_HOST');
// {
//   key: 'DB_PRIMARY_HOST',
//   segments: ['DB', 'PRIMARY', 'HOST'],
//   depth: 3,
//   prefix: 'DB',
//   base: 'HOST'
// }
```

### `tokenizeEnv(env, delimiter?)`

Tokenize all keys in an env object. Each entry includes the original `value`.

```js
const { tokenizeEnv } = require('./src/tokenizer');

const tokens = tokenizeEnv({ DB_HOST: 'localhost', PORT: '3000' });
```

### `groupTokensByPrefix(tokens)`

Group an array of tokens by their top-level prefix. Keys with no prefix are grouped under `__root__`.

```js
const { groupTokensByPrefix } = require('./src/tokenizer');

const groups = groupTokensByPrefix(tokens);
// { DB: [...], __root__: [...] }
```

### `summarizeTokens(tokens)`

Return a high-level summary of a token array.

```js
const { summarizeTokens } = require('./src/tokenizer');

summarizeTokens(tokens);
// { total: 5, maxDepth: 3, prefixes: ['DB', 'APP'] }
```

## Notes

- Custom delimiters (e.g. `.`) are supported in all functions.
- Throws on invalid or empty keys.
