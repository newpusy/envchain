# renamer

Rename, remap, and alias environment variable keys in an env object.

## API

### `renameKey(env, oldKey, newKey)`

Renames a single key. Returns a new object — original is not mutated.

```js
const { renameKey } = require('envchain/renamer');

const result = renameKey({ FOO: 'bar', BAZ: 'qux' }, 'FOO', 'NEW_FOO');
// { NEW_FOO: 'bar', BAZ: 'qux' }
```

If `oldKey` does not exist, the original object is returned as a copy.

---

### `renameKeys(env, renameMap)`

Renames multiple keys at once using a `{ oldKey: newKey }` map.

```js
const { renameKeys } = require('envchain/renamer');

const result = renameKeys(
  { A: '1', B: '2', C: '3' },
  { A: 'ALPHA', B: 'BETA' }
);
// { ALPHA: '1', BETA: '2', C: '3' }
```

Keys not present in `renameMap` are passed through unchanged.

---

### `mapKeys(env, fn)`

Applies a transform function to every key.

```js
const { mapKeys } = require('envchain/renamer');

const result = mapKeys({ foo: '1', bar: '2' }, k => k.toUpperCase());
// { FOO: '1', BAR: '2' }
```

Throws if the transform returns an empty or non-string value.

---

### `previewRename(env, renameMap)`

Returns a dry-run summary of what renames would occur, including whether each source key exists.

```js
const { previewRename } = require('envchain/renamer');

previewRename({ FOO: 'bar' }, { FOO: 'NEW_FOO', MISSING: 'X' });
// [
//   { from: 'FOO', to: 'NEW_FOO', exists: true },
//   { from: 'MISSING', to: 'X', exists: false }
// ]
```

Useful for validating rename configs before applying them.
