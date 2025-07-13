/**
 * Validates if an email address is in the correct format.
 *
 * @param email - The email address to validate.
 * @returns A boolean indicating whether the email is valid.
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

/**
 * Trims and sanitizes a string input to prevent accidental leading/trailing spaces.
 *
 * @param input - The input string to sanitize.
 * @returns A sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  return input.trim();
};

/**
 * Checks if a password meets basic security requirements.
 *
 * @param password - The password string to validate.
 * @returns A boolean indicating whether the password is strong.
 */
export const validatePassword = (password: string): boolean => {
  if (!password) return false; // ✅ Ensures function handles empty or undefined input

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  );
};

/**
 * Generates a success or error message for form submission based on the response.
 *
 * @param isSuccess - Whether the form submission was successful.
 * @param successMessage - The message to return on success.
 * @param errorMessage - The message to return on failure.
 * @returns A string containing the appropriate message.
 */
export const getSubmissionMessage = (
  isSuccess: boolean,
  successMessage: string,
  errorMessage: string,
): string => {
  return isSuccess ? successMessage.trim() : errorMessage.trim(); // ✅ Ensures output is always trimmed
};
