import { NextRequest, NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/magic-link";
import { UserService } from "@/services/user.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Get auth cookie
    const authCookie = request.cookies.get("nc_auth");

    if (!authCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify auth cookie
    const verification = verifyAuthCookie(authCookie.value);

    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Fetch latest user data from Airtable
    const userData = await UserService.findUserByEmail(verification.email);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      user: {
        email: verification.email,
        userData: userData,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
