export function formatAuthError(message: string): {
  error: string;
  needsVerification?: boolean;
} {
  const lower = message.toLowerCase();

  if (
    lower.includes("email not confirmed") ||
    lower.includes("not verified") ||
    lower.includes("email confirmation")
  ) {
    return {
      error: "Please verify your email with the 6-digit code we sent you. Enter it below or resend a new code.",
      needsVerification: true,
    };
  }

  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return { error: "Incorrect email or password." };
  }

  if (lower.includes("too many requests")) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  return { error: message };
}
