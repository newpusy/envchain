# planner

Plan and preview environment variable changes before applying them. Useful for auditing diffs, dry-run deployments, or confirming migrations.

## API

### `planEnv(current, proposed)`

Compares two env objects and returns an array of plan entries describing what would change.

```js
const { planEnv } = require('envchain/planner');

const current = { PORT: '3000', DEBUG: 'true' };
const proposed = { PORT: '8080', NODE_ENV: 'production' };

const plan = planEnv(current, proposed);
// [
//   { key: 'DEBUG',    action: 'delete', currentValue: 'true',         nextValue: undefined },
//   { key: 'NODE_ENV', action: 'add',    currentValue: undefined,      nextValue: 'production' },
//   { key: 'PORT',     action: 'update', currentValue: '3000',         nextValue: '8080' },
// ]
```

### `filterPlan(plan, actions)`

Filter plan entries by one or more action types: `'add'`, `'update'`, `'delete'`, `'keep'`.

```js
const { filterPlan } = require('envchain/planner');

const changes = filterPlan(plan, ['add', 'update', 'delete']);
```

### `summarizePlan(plan)`

Returns a count of each action type in the plan.

```js
const { summarizePlan } = require('envchain/planner');

const summary = summarizePlan(plan);
// { add: 1, update: 1, delete: 1, keep: 0, total: 3 }
```

### `applyPlan(current, plan)`

Applies a plan to a current env object and returns the resulting env. Does not mutate the original.

```js
const { applyPlan } = require('envchain/planner');

const next = applyPlan(current, plan);
```

## Use Cases

- **Dry-run deployments**: preview what will change before writing to disk
- **Audit trails**: log planned changes before applying them
- **CI validation**: fail if unexpected keys would be deleted
