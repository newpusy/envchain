# cascader

Cascade environment variables through ordered priority layers, with source tracking and override summaries.

## Usage

```js
const { cascadeEnvs, resolveKey, summarizeCascade } = require('./src/cascader');

const layers = [
  { name: 'base', env: { PORT: '3000', HOST: 'localhost', DEBUG: 'false' } },
  { name: 'development', env: { DEBUG: 'true' } },
  { name: 'local', env: { PORT: '4000' } }
];

const { result, sources } = cascadeEnvs(layers);
// result => { PORT: '4000', HOST: 'localhost', DEBUG: 'true' }
// sources => { PORT: 'local', HOST: 'base', DEBUG: 'development' }
```

## API

### `cascadeEnvs(layers)`

Merges an array of `{ name, env }` layers from lowest to highest priority.

- **layers** `Array<{ name: string, env: object }>` — ordered list, last wins
- Returns `{ result, sources }` where `sources` maps each key to the layer name that set it

### `resolveKey(layers, key)`

Resolves a single key across all layers.

- **layers** — same format as `cascadeEnvs`
- **key** `string` — the env key to look up
- Returns `{ value, source }`

```js
const { value, source } = resolveKey(layers, 'PORT');
// value => '4000', source => 'local'
```

### `summarizeCascade(layers)`

Returns a report of which keys were overridden and by which layers.

```js
const summary = summarizeCascade(layers);
// [
//   { key: 'PORT', finalSource: 'local', overriddenBy: ['local'] },
//   { key: 'HOST', finalSource: 'base', overriddenBy: [] },
//   { key: 'DEBUG', finalSource: 'development', overriddenBy: ['development'] }
// ]
```

## Notes

- Layers are applied left-to-right; the last layer wins on conflicts.
- Invalid or `null` env objects in a layer are silently skipped.
- Pairs well with `merger.js` and `resolver.js` for file-based workflows.
