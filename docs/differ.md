# differ

The `differ` module computes the difference between two env snapshots, making it easy to detect configuration drift between reloads, deployments, or file versions.

## API

### `diffEnvs(previous, current)`

Compares two plain env objects and returns a structured diff.

```js
const { diffEnvs } = require('./src/differ');

const prev = { PORT: '3000', DEBUG: 'false' };
const curr = { PORT: '4000', NODE_ENV: 'production' };

const diff = diffEnvs(prev, curr);
// {
//   added:   { NODE_ENV: 'production' },
//   removed: { DEBUG: 'false' },
//   changed: { PORT: { from: '3000', to: '4000' } }
// }
```

### `isEnvEqual(previous, current)`

Returns `true` if both env objects are identical (no added, removed, or changed keys).

```js
const { isEnvEqual } = require('./src/differ');

isEnvEqual({ A: '1' }, { A: '1' }); // true
isEnvEqual({ A: '1' }, { A: '2' }); // false
```

### `summarizeDiff(diff)`

Formats a diff object into a human-readable multi-line string.

```js
const { summarizeDiff } = require('./src/differ');

console.log(summarizeDiff(diff));
// + NODE_ENV=production
// - DEBUG=false
// ~ PORT: 3000 -> 4000
```

## Use cases

- Logging config changes when `.env` files are hot-reloaded via `watcher.js`
- Auditing environment drift between deployment stages
- Displaying a changelog when merging multiple env files
