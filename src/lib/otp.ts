import crypto from "crypto";

function getOtpSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for OTP hashing.");
  return secret;
}

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(code: string, email: string): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

export function verifyOtp(code: string, email: string, hash: string): boolean {
  const expected = hashOtp(code, email);
  if (expected.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}
