import { createHmac, timingSafeEqual } from "crypto";
import { UserData } from "@/services/user.service";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback-secret-key";

export interface MagicLinkPayload {
  email: string;
  exp: number; // expiration timestamp
}

export interface AuthCookiePayload {
  email: string;
  exp: number;
  userData?: UserData;
}

export function createMagicLink(email: string): string {
  const payload: MagicLinkPayload = {
    email,
    exp: Date.now() + 20 * 60 * 1000, // 20 minutes from now
  };

  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString("base64url");

  // Create HMAC SHA-256 signature
  const signature = createHmac("sha256", SECRET_KEY)
    .update(payloadBase64)
    .digest("base64url");

  const token = `${payloadBase64}.${signature}`;

  return `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
}

export function verifyMagicLink(token: string): {
  valid: boolean;
  email?: string;
  error?: string;
} {
  try {
    const [payloadBase64, signature] = token.split(".");

    if (!payloadBase64 || !signature) {
      return { valid: false, error: "Invalid token format" };
    }

    // Verify signature
    const expectedSignature = createHmac("sha256", SECRET_KEY)
      .update(payloadBase64)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature, "base64url");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");

    if (!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      return { valid: false, error: "Invalid signature" };
    }

    // Parse payload
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString();
    const payload: MagicLinkPayload = JSON.parse(payloadStr);

    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, email: payload.email };
  } catch (error) {
    return { valid: false, error: "Invalid token" };
  }
}

export function createAuthCookie(email: string, userData?: UserData): string {
  const payload: AuthCookiePayload = {
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    userData,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString("base64url");

  const signature = createHmac("sha256", SECRET_KEY)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

export function verifyAuthCookie(cookieValue: string): {
  valid: boolean;
  email?: string;
  userData?: UserData;
} {
  try {
    const [payloadBase64, signature] = cookieValue.split(".");

    if (!payloadBase64 || !signature) {
      return { valid: false };
    }

    // Verify signature
    const expectedSignature = createHmac("sha256", SECRET_KEY)
      .update(payloadBase64)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature, "base64url");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");

    if (!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      return { valid: false };
    }

    // Parse payload
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString();
    const payload: AuthCookiePayload = JSON.parse(payloadStr);

    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return {
      valid: true,
      email: payload.email,
      userData: payload.userData,
    };
  } catch (error) {
    return { valid: false };
  }
}
