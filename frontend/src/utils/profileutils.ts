// src/utils/profileUtils.ts

import CryptoJS from 'crypto-js';

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format username by trimming spaces and collapsing multiple spaces.
 */
export const formatUserName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Securely hash a password using SHA-256 (Web Crypto API).
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Check password strength: at least 8 chars, one letter, one digit, one special.
 */
export const isPasswordStrong = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Generate a Gravatar URL using MD5 hashing from crypto-js.
 */
export const generateAvatarUrl = (email: string): string => {
  const hash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};
