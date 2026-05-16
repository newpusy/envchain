# scorer

Score environment variable configs based on quality heuristics. Useful for CI checks or developer feedback.

## API

### `scoreEntry(key, value)`

Scores a single key-value pair from 0 to 100.

```js
const { scoreEntry } = require('./src/scorer');

scoreEntry('DB_PASSWORD', 'changeme');
// => { score: 30, reasons: ['placeholder value detected', 'sensitive key has short value'] }

scoreEntry('APP_NAME', 'myapp');
// => { score: 100, reasons: [] }
```

**Penalties applied for:**
- Empty value (`-30`)
- Placeholder value like `changeme`, `todo`, `xxx` (`-40`)
- Sensitive key with short value (`-25`)
- Key not in `SCREAMING_SNAKE_CASE` (`-10`)
- Sensitive key with weak boolean-like value (`-20`)

---

### `scoreEnv(env)`

Scores all entries in an env object and returns per-entry results plus an overall average.

```js
const { scoreEnv } = require('./src/scorer');

const result = scoreEnv({
  APP_NAME: 'myapp',
  DB_PASSWORD: 'changeme',
  NODE_ENV: 'production'
});

console.log(result.overall); // e.g. 67
console.log(result.entries['DB_PASSWORD']);
// => { score: 30, reasons: [...] }
```

---

### `summarizeScore(scoreResult)`

Formats the score result into a human-readable string.

```js
const { scoreEnv, summarizeScore } = require('./src/scorer');

const result = scoreEnv(process.env);
console.log(summarizeScore(result));
// Overall score: 74/100
//   DB_PASSWORD [30]: placeholder value detected, sensitive key has short value
```

---

## Use in CI

```js
const { scoreEnv } = require('envchain/scorer');
const result = scoreEnv(process.env);
if (result.overall < 70) {
  console.error('Env quality too low:', result.overall);
  process.exit(1);
}
```
