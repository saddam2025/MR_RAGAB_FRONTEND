export const PASSWORD_POLICY_MESSAGE = 'كلمة المرور يجب أن تكون 12 حرفًا على الأقل وتحتوي على حروف وأرقام';

export function passwordRequirements(value) {
  const password = typeof value === 'string' ? value : '';
  return {
    minLength: password.length >= 12,
    hasLetter: /[A-Za-z\u0621-\u064A]/.test(password),
    hasDigit: /[0-9\u0660-\u0669]/.test(password)
  };
}

export function hasValidPassword(value) {
  return Object.values(passwordRequirements(value)).every(Boolean);
}
