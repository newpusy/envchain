/**
 * encryptor.js
 * Encrypt and decrypt sensitive env values using AES-256-GCM
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a 32-byte key from a passphrase using SHA-256
 * @param {string} passphrase
 * @returns {Buffer}
 */
function deriveKey(passphrase) {
  return crypto.createHash('sha256').update(passphrase).digest();
}

/**
 * Encrypts a plaintext string value
 * @param {string} value - plaintext env value
 * @param {string} passphrase - secret key
 * @returns {string} - encrypted string in format: iv:tag:ciphertext (hex)
 */
function encryptValue(value, passphrase) {
  if (typeof value !== 'string') throw new TypeError('value must be a string');
  if (!passphrase) throw new Error('passphrase is required');

  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypts an encrypted env value
 * @param {string} encryptedValue - iv:tag:ciphertext (hex)
 * @param {string} passphrase - secret key
 * @returns {string} - decrypted plaintext
 */
function decryptValue(encryptedValue, passphrase) {
  if (!encryptedValue) throw new Error('encryptedValue is required');
  if (!passphrase) throw new Error('passphrase is required');

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) throw new Error('invalid encrypted value format');

  const [ivHex, tagHex, ciphertextHex] = parts;
  const key = deriveKey(passphrase);
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

/**
 * Encrypts all values in an env object
 * @param {Object} env
 * @param {string} passphrase
 * @returns {Object}
 */
function encryptEnv(env, passphrase) {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, encryptValue(v, passphrase)])
  );
}

/**
 * Decrypts all values in an env object
 * @param {Object} env
 * @param {string} passphrase
 * @returns {Object}
 */
function decryptEnv(env, passphrase) {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, decryptValue(v, passphrase)])
  );
}

module.exports = { encryptValue, decryptValue, encryptEnv, decryptEnv };
