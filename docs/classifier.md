# classifier

Classify environment variable keys into semantic categories based on naming conventions.

## Categories

| Category   | Pattern Examples                          |
|------------|-------------------------------------------|
| `auth`     | `JWT_SECRET`, `API_KEY`, `PASSWORD`       |
| `database` | `DB_HOST`, `POSTGRES_URL`, `REDIS_PORT`   |
| `network`  | `PORT`, `HOST`, `API_URL`, `ENDPOINT`     |
| `feature`  | `FEATURE_X`, `ENABLE_CACHE`, `TOGGLE_Y`   |
| `logging`  | `LOG_LEVEL`, `DEBUG`, `VERBOSE`           |
| `infra`    | `AWS_REGION`, `S3_BUCKET`, `GCP_PROJECT`  |
| `email`    | `SMTP_HOST`, `SENDGRID_API_KEY`           |
| `app`      | `APP_NAME`, `NODE_ENV`, `VERSION`         |
| `other`    | anything that doesn't match above         |

## API

### `classifyKey(key)`

Returns the category string for a single key.

```js
const { classifyKey } = require('./classifier');
classifyKey('JWT_SECRET'); // 'auth'
classifyKey('PORT');       // 'network'
classifyKey('FOOBAR');     // 'other'
```

### `classifyEnv(env)`

Annotates every key in an env object with its category.

```js
const result = classifyEnv({ JWT_SECRET: 'abc', PORT: '3000' });
// { JWT_SECRET: { value: 'abc', category: 'auth' }, PORT: { value: '3000', category: 'network' } }
```

### `groupByCategory(env)`

Groups keys by their resolved category.

```js
const groups = groupByCategory(env);
// { auth: ['JWT_SECRET'], network: ['PORT'], ... }
```

### `summarizeClassification(env)`

Returns a count breakdown across all categories.

```js
const { total, breakdown } = summarizeClassification(env);
// { total: 5, breakdown: { auth: 2, network: 1, other: 2 } }
```
