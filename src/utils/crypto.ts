/**
 * AES-256 encryption utilities using Web Crypto API
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

/**
 * Derives a crypto key from a password string
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    } as Pbkdf2Params,
    baseKey,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(password, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    encodedData
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using AES-256-GCM
 */
export async function decryptData(encryptedBase64: string, password: string): Promise<string> {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split('')
      .map(char => char.charCodeAt(0))
  );

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 16 + IV_LENGTH);
  const data = combined.slice(16 + IV_LENGTH);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error('Failed to decrypt data. Incorrect password or corrupted data.');
  }
}
