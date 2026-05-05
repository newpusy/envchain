# envchain

Lightweight utility to chain and validate environment variable configs across multiple `.env` files.

---

## Installation

```bash
npm install envchain
```

---

## Usage

```javascript
import envchain from 'envchain';

const config = envchain(['.env', '.env.local', '.env.production'])
  .require(['DATABASE_URL', 'API_KEY'])
  .optional(['DEBUG', 'PORT'], { PORT: '3000' })
  .validate({
    PORT: (val) => !isNaN(val),
  })
  .resolve();

console.log(config.PORT);      // '3000'
console.log(config.API_KEY);   // loaded from first matching .env file
```

Files are loaded in order — later files override earlier ones. If a required variable is missing after all files are processed, `envchain` throws an error with a clear message indicating which variable is absent.

---

## API

| Method | Description |
|---|---|
| `require(keys)` | Mark variables as required |
| `optional(keys, defaults)` | Mark variables as optional with fallback defaults |
| `validate(rules)` | Apply custom validation functions per key |
| `resolve()` | Process all files and return the final config object |

---

## License

[MIT](./LICENSE)