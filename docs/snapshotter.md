# Snapshotter

The `snapshotter` module lets you capture, persist, and compare snapshots of your environment variable state. Useful for auditing changes between deployments or CI runs.

## API

### `createSnapshot(env, options?)`

Creates a snapshot object from a plain env key-value map.

```js
const { createSnapshot } = require('./src/snapshotter');
const snap = createSnapshot(process.env, { label: 'before-migration' });
```

**Options:**
- `label` *(string)* — optional human-readable label

**Returns:** `{ label, timestamp, keys, env }`

---

### `saveSnapshot(snapshot, filePath)`

Persists a snapshot as a JSON file. Creates parent directories if needed.

```js
saveSnapshot(snap, '.snapshots/before.json');
```

---

### `loadSnapshot(filePath)`

Loads a previously saved snapshot from disk.

```js
const snap = loadSnapshot('.snapshots/before.json');
```

Throws if the file does not exist.

---

### `compareSnapshots(snapshotA, snapshotB)`

Returns a diff between two snapshots.

```js
const diff = compareSnapshots(snapBefore, snapAfter);
console.log(diff.added);   // keys added in B
console.log(diff.removed); // keys removed in B
console.log(diff.changed); // keys whose values changed
```

---

## Example workflow

```js
const { createSnapshot, saveSnapshot, loadSnapshot, compareSnapshots } = require('./src/snapshotter');

// Before deploy
const before = createSnapshot(process.env, { label: 'pre-deploy' });
saveSnapshot(before, '.snapshots/pre.json');

// After deploy
const after = createSnapshot(process.env, { label: 'post-deploy' });
const diff = compareSnapshots(loadSnapshot('.snapshots/pre.json'), after);
console.log('Changed vars:', diff.changed);
```
