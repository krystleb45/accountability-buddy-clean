import crypto from "node:crypto"

/**
 * ========================================================================
 * Crypto Helper for encrypting and decrypting text messages
 * Uses AES-256-GCM for authenticated encryption
 * ========================================================================
 */

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits
const ENCODING: BufferEncoding = "base64"

/**
 * Get encryption key from environment variable
 * @returns Buffer containing the encryption key
 * @throws Error if ENCRYPTION_KEY is not set or invalid
 */
function getEncryptionKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY

  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }

  if (encryptionKey.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 characters (32 bytes) long")
  }

  return Buffer.from(encryptionKey, "hex")
}

/**
 * Encrypts a text message using AES-256-GCM
 * @param text - The plain text message to encrypt
 * @returns Promise<string> - Base64 encoded encrypted data with IV and auth tag
 * @throws Error if encryption fails
 */
export async function encryptMessage(text: string): Promise<string> {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Text must be a non-empty string")
    }

    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    cipher.setAAD(Buffer.from("accountability-buddy", "utf8")) // Additional authenticated data

    let encrypted = cipher.update(text, "utf8")
    encrypted = Buffer.concat([encrypted, cipher.final()])

    const authTag = cipher.getAuthTag()

    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([iv, encrypted, authTag])

    return combined.toString(ENCODING)
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Decrypts an encrypted message
 * @param encryptedData - Base64 encoded encrypted data with IV and auth tag
 * @returns Promise<string> - The decrypted plain text message
 * @throws Error if decryption fails
 */
export async function decryptMessage(encryptedData: string): Promise<string> {
  try {
    if (!encryptedData || typeof encryptedData !== "string") {
      throw new Error("Encrypted data must be a non-empty string")
    }

    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedData, ENCODING)

    if (combined.length < IV_LENGTH + TAG_LENGTH) {
      throw new Error("Invalid encrypted data format")
    }

    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH, -TAG_LENGTH)
    const authTag = combined.subarray(-TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    decipher.setAAD(Buffer.from("accountability-buddy", "utf8")) // Same AAD as encryption

    let decrypted = decipher.update(encrypted, undefined, "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
