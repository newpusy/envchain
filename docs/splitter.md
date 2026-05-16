# splitter

Split an env object into named buckets based on predicate functions.

## Functions

### `splitEnv(env, predicate)`

Splits an env object into two groups: keys where `predicate(key, value)` returns `true` (`matched`) and those where it returns `false` (`unmatched`).

```js
const { splitEnv } = require('./src/splitter');

const { matched, unmatched } = splitEnv(process.env, (key) => key.startsWith('DB_'));
console.log(matched);   // { DB_HOST: '...', DB_PORT: '...' }
console.log(unmatched); // everything else
```

### `splitIntoBuckets(env, bucketDefs)`

Splits an env object into multiple named buckets. Each key is assigned to the **first** bucket whose predicate matches. Unmatched keys are placed in `_rest`.

```js
const { splitIntoBuckets } = require('./src/splitter');

const buckets = splitIntoBuckets(process.env, {
  db:      (key) => key.startsWith('DB_'),
  app:     (key) => key.startsWith('APP_'),
  secrets: (key) => key.startsWith('SECRET_'),
});

console.log(buckets.db);      // { DB_HOST: '...', ... }
console.log(buckets.secrets); // { SECRET_KEY: '...', ... }
console.log(buckets._rest);   // unmatched keys
```

### `summarizeSplit(buckets)`

Returns a count of keys per bucket.

```js
const { splitIntoBuckets, summarizeSplit } = require('./src/splitter');

const buckets = splitIntoBuckets(process.env, { db: (k) => k.startsWith('DB_') });
console.log(summarizeSplit(buckets));
// { db: 2, _rest: 10 }
```

## Notes

- Bucket order matters — a key is placed in the **first** matching bucket only.
- All defined buckets are always present in the result, even if empty.
- `_rest` is always included for unmatched keys.
