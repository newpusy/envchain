# Profiler

The `profiler` module provides lightweight timing utilities to track how long env loading operations take. Useful for diagnosing slow startup times in large projects with many `.env` files.

## API

### `startProfile(name)`

Starts a named profiling session. Returns an object with a `stop()` method.

```js
const { startProfile } = require('envchain/profiler');

const p = startProfile('loadEnvChain');
// ... do work ...
const entry = p.stop();
console.log(entry);
// { name: 'loadEnvChain', startedAt: 1710000000000, durationMs: 3.142, durationNs: 3142000 }
```

### `getProfiles()`

Returns a copy of all recorded profile entries.

```js
const { getProfiles } = require('envchain/profiler');
console.log(getProfiles());
```

### `clearProfiles()`

Clears all recorded profile entries. Useful in tests or between runs.

```js
const { clearProfiles } = require('envchain/profiler');
clearProfiles();
```

### `summarizeProfiles()`

Returns a summary grouped by operation name, including count, total ms, and average ms.

```js
const { summarizeProfiles } = require('envchain/profiler');
console.log(summarizeProfiles());
// {
//   loadEnvChain: { count: 2, totalMs: 6.284, avgMs: 3.142 },
//   parseEnvContent: { count: 5, totalMs: 1.25, avgMs: 0.25 }
// }
```

## Use with envchain

Wrap any envchain operation with `startProfile` to measure its cost:

```js
const { startProfile } = require('envchain/profiler');
const { envchain } = require('envchain');

const p = startProfile('envchain');
const env = envchain({ files: ['.env', '.env.local'] });
p.stop();
```
