export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) errors.push('Must be at least 8 characters long.');
  if (!hasUppercase) errors.push('Must contain at least 1 uppercase letter.');
  if (!hasLowercase) errors.push('Must contain at least 1 lowercase letter.');
  if (!hasNumber) errors.push('Must contain at least 1 digit.');
  if (!hasSpecialChar) errors.push('Must contain at least 1 special character (e.g. @, $, !, %, *, ?, &, #, etc.).');

  return {
    isValid: errors.length === 0,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    errors,
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
