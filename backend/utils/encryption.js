const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

/**
 * NOTE: This provides AES-256 encryption of message text AT REST (in the database)
 * and helps protect data if the database is ever leaked or dumped.
 * This is NOT full client-to-client End-to-End Encryption (E2EE) like real WhatsApp,
 * because the server still holds the key and can decrypt messages.
 * True E2EE requires each client to hold its own private key and encrypt/decrypt
 * on-device (e.g. using the Signal Protocol), which is out of scope for a pure
 * backend-only, no-cost implementation.
 */

function getKey() {
    const rawKey = process.env.MESSAGE_ENCRYPTION_KEY || 'default_32_char_dev_only_key!!!!';
    // Ensure key is exactly 32 bytes for AES-256
    return crypto.createHash('sha256').update(String(rawKey)).digest();
}

function encryptText(plainText) {
    if (plainText === null || plainText === undefined) return plainText;
    const iv = crypto.randomBytes(16);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(String(plainText), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptText(encryptedPayload) {
    if (!encryptedPayload || typeof encryptedPayload !== 'string' || !encryptedPayload.includes(':')) {
        return encryptedPayload;
    }
    try {
        const [ivHex, encryptedHex] = encryptedPayload.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = getKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return '[unable to decrypt message]';
    }
}

module.exports = { encryptText, decryptText };
