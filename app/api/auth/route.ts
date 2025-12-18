import { NextRequest, NextResponse } from "next/server";
import {
  createMagicLink,
  verifyMagicLink,
  createAuthCookie,
} from "@/lib/magic-link";
import { brevoEmailService } from "@/lib/brevo";
import { UserService } from "@/services/user.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const req = searchParams.get("req");
  const token = searchParams.get("token");

  // Handle verification
  if (req === "verify" && token) {
    const verification = verifyMagicLink(token);

    if (!verification.valid) {
      const errorCode =
        verification.error === "Token expired" ? "expired" : "invalid-token";
      return NextResponse.redirect(
        new URL(`/sign-in?error=${errorCode}`, request.url)
      );
    }

    // Get user from Airtable (skip creation if not found)
    const userData = await UserService.findUserByEmail(verification.email!);

    if (!userData) {
      console.error("❌ User not found in Airtable:", verification.email);
      return NextResponse.redirect(
        new URL(`/sign-in?error=user-not-found`, request.url)
      );
    }

    // Note: Commenting out automatic user creation as requested
    // const userData = await UserService.getOrCreateUser(verification.email!);

    // if (!userData) {
    //   console.error("❌ Failed to get or create user data");
    //   return NextResponse.redirect(
    //     new URL(`/sign-in?error=user-creation-failed`, request.url)
    //   );
    // }

    // Create auth cookie with user data
    const cookieValue = createAuthCookie(verification.email!, userData);

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("nc_auth", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 1 year - persist until manual logout
      path: "/",
    });

    return response;
  }

  // Handle logout
  if (req === "logout") {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));

    // Delete the auth cookie completely
    response.cookies.set("nc_auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const req = searchParams.get("req");

  // Handle magic link request
  if (req === "request-link") {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }

      const magicLink = createMagicLink(email);

      // Check if Brevo is configured
      if (!process.env.BREVO_API_KEY) {
        return NextResponse.json({
          ok: true,
          dev_link: magicLink,
          message: "Development mode: Magic link generated but email not sent",
        });
      }

      // Send email via Brevo
      await brevoEmailService.sendMagicLink({
        to: email,
        magicLink,
      });

      return NextResponse.json({
        ok: true,
        message: "Magic link sent successfully",
      });
    } catch (error) {
      console.error("Failed to send magic link:", error);
      return NextResponse.json(
        {
          error: "Failed to send magic link",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
