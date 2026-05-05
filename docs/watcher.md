# envchain — File Watcher

The `watchEnvFiles` utility lets you watch one or more `.env` files for changes
and automatically reload the merged environment configuration.

## Usage

```js
const { watchEnvFiles } = require('envchain/src/watcher');

const handle = watchEnvFiles(
  ['.env', '.env.local'],
  (err, merged, meta) => {
    if (err) {
      console.error('Failed to reload env:', err);
      return;
    }
    console.log('Env reloaded:', merged);
    console.log('Triggered by:', meta.filename, meta.eventType);
  },
  { debounceMs: 300 } // optional, default 300ms
);

// Later, to stop watching:
handle.stop();
```

## API

### `watchEnvFiles(filePaths, onChange, options?)`

| Param | Type | Description |
|---|---|---|
| `filePaths` | `string[]` | Paths to `.env` files to watch |
| `onChange` | `function(err, merged, meta)` | Callback on change |
| `options.debounceMs` | `number` | Debounce window (default `300`) |

Returns `{ stop() }` — call `stop()` to unwatch all files.

## Notes

- Files that do not exist at watch-start are silently skipped.
- Changes are debounced to avoid rapid successive reloads.
- The callback receives the fully merged env object from `loadEnvChain`.
