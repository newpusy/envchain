# Encryptor

The `encryptor` module provides AES-256-GCM encryption and decryption for sensitive environment variable values.

## Why encrypt env values?

Storing secrets in `.env` files is convenient but risky if those files are accidentally committed or shared. The encryptor lets you store ciphertext in your env files and decrypt at runtime using a passphrase.

## API

### `encryptValue(value, passphrase)`

Encrypts a single string value.

```js
const { encryptValue } = require('./src/encryptor');

const encrypted = encryptValue('my-secret', 'my-passphrase');
// => 'a1b2c3...:d4e5f6...:7890ab...'
```

Returns a colon-separated hex string: `iv:authTag:ciphertext`.

### `decryptValue(encryptedValue, passphrase)`

Decrypts a previously encrypted value.

```js
const { decryptValue } = require('./src/encryptor');

const plain = decryptValue(encrypted, 'my-passphrase');
// => 'my-secret'
```

Throws if the passphrase is wrong or the value is tampered with (GCM auth tag validation).

### `encryptEnv(env, passphrase)`

Encrypts all values in an env object.

```js
const { encryptEnv } = require('./src/encryptor');

const encrypted = encryptEnv({ DB_PASS: 'hunter2', API_KEY: 'abc' }, 'passphrase');
```

### `decryptEnv(env, passphrase)`

Decrypts all values in an env object.

```js
const { decryptEnv } = require('./src/encryptor');

const plain = decryptEnv(encrypted, 'passphrase');
```

## Security notes

- A random 16-byte IV is generated per encryption, so identical plaintexts produce different ciphertexts.
- AES-256-GCM provides authenticated encryption — any tampering with the ciphertext will cause decryption to throw.
- The passphrase is hashed with SHA-256 to produce the 32-byte key. Use a strong, unique passphrase.
- Never commit the passphrase itself. Pass it via a secure secret manager or a separate env variable not stored in any `.env` file.
