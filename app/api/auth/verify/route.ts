import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink, createAuthCookie } from "@/lib/magic-link";
import { UserService } from "@/services/user.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing-token", request.url)
    );
  }

  const verification = verifyMagicLink(token);

  if (!verification.valid) {
    const errorCode =
      verification.error === "Token expired" ? "expired" : "invalid-token";
    return NextResponse.redirect(
      new URL(`/sign-in?error=${errorCode}`, request.url)
    );
  }

  // Get or create user in Airtable
  const userData = await UserService.getOrCreateUser(verification.email!);

  if (!userData) {
    console.error("❌ Failed to get or create user data");
    return NextResponse.redirect(
      new URL("/sign-in?error=user-creation-failed", request.url)
    );
  }

  // Create auth cookie with user data
  const cookieValue = createAuthCookie(verification.email!, userData);

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("nc_auth", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
  
  return response;
}
