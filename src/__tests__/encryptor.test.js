const { encryptValue, decryptValue, encryptEnv, decryptEnv } = require('../encryptor');

const PASSPHRASE = 'super-secret-passphrase';

describe('encryptValue / decryptValue', () => {
  test('encrypts a string and returns hex triplet', () => {
    const result = encryptValue('hello', PASSPHRASE);
    const parts = result.split(':');
    expect(parts).toHaveLength(3);
    parts.forEach(p => expect(p).toMatch(/^[0-9a-f]+$/));
  });

  test('decrypts back to original value', () => {
    const original = 'my-secret-db-password';
    const encrypted = encryptValue(original, PASSPHRASE);
    expect(decryptValue(encrypted, PASSPHRASE)).toBe(original);
  });

  test('each encryption produces a different ciphertext (random IV)', () => {
    const a = encryptValue('same', PASSPHRASE);
    const b = encryptValue('same', PASSPHRASE);
    expect(a).not.toBe(b);
  });

  test('throws if value is not a string', () => {
    expect(() => encryptValue(123, PASSPHRASE)).toThrow('value must be a string');
  });

  test('throws if passphrase is missing on encrypt', () => {
    expect(() => encryptValue('val', '')).toThrow('passphrase is required');
  });

  test('throws if passphrase is missing on decrypt', () => {
    const enc = encryptValue('val', PASSPHRASE);
    expect(() => decryptValue(enc, '')).toThrow('passphrase is required');
  });

  test('throws on wrong passphrase (auth tag mismatch)', () => {
    const enc = encryptValue('secret', PASSPHRASE);
    expect(() => decryptValue(enc, 'wrong-passphrase')).toThrow();
  });

  test('throws on malformed encrypted value', () => {
    expect(() => decryptValue('notvalid', PASSPHRASE)).toThrow('invalid encrypted value format');
  });
});

describe('encryptEnv / decryptEnv', () => {
  const env = {
    DB_PASSWORD: 'hunter2',
    API_KEY: 'abc123',
    SECRET_TOKEN: 'tok_xyz',
  };

  test('encrypts all values in an object', () => {
    const encrypted = encryptEnv(env, PASSPHRASE);
    expect(Object.keys(encrypted)).toEqual(Object.keys(env));
    Object.values(encrypted).forEach(v => {
      expect(v.split(':')).toHaveLength(3);
    });
  });

  test('decrypts all values back to originals', () => {
    const encrypted = encryptEnv(env, PASSPHRASE);
    const decrypted = decryptEnv(encrypted, PASSPHRASE);
    expect(decrypted).toEqual(env);
  });

  test('returns empty object for empty input', () => {
    expect(encryptEnv({}, PASSPHRASE)).toEqual({});
    expect(decryptEnv({}, PASSPHRASE)).toEqual({});
  });
});
