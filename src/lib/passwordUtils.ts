export interface PasswordStrength {
  passed: boolean;
  checks: { label: string; ok: boolean }[];
}

export function checkPassword(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "At least one uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", ok: /[a-z]/.test(password) },
    { label: "At least one number", ok: /[0-9]/.test(password) },
    { label: "At least one special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}