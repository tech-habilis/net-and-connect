import { NextRequest, NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/magic-link";
import { UserService } from "@/services/user.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Get auth cookie from request
    const authCookie = request.cookies.get("nc_auth")?.value;

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = verifyAuthCookie(authCookie);
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "spend") {
      const body = await request.json();
      const { amount } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // Get current user data
      const userData = await UserService.findUserByEmail(verification.email);
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user has enough tokens
      if (userData.tokens < amount) {
        return NextResponse.json(
          { error: "Insufficient tokens" },
          { status: 400 }
        );
      }

      // Update tokens
      const newTokenAmount = userData.tokens - amount;
      const updatedUser = await UserService.updateUserTokens(
        userData.id,
        newTokenAmount
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Failed to update tokens" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        transaction: {
          type: "spend",
          amount: amount,
          previousBalance: userData.tokens,
          newBalance: newTokenAmount,
        },
      });
    }

    if (action === "add") {
      const body = await request.json();
      const { amount } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // Get current user data
      const userData = await UserService.findUserByEmail(verification.email);
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update tokens
      const newTokenAmount = userData.tokens + amount;
      const updatedUser = await UserService.updateUserTokens(
        userData.id,
        newTokenAmount
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Failed to update tokens" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        transaction: {
          type: "add",
          amount: amount,
          previousBalance: userData.tokens,
          newBalance: newTokenAmount,
        },
      });
    }

    if (action === "balance") {
      // Just return current balance
      const userData = await UserService.findUserByEmail(verification.email);
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: userData,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Token transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth cookie from request
    const authCookie = request.cookies.get("nc_auth")?.value;

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = verifyAuthCookie(authCookie);
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      );
    }

    // Get current user data
    const userData = await UserService.findUserByEmail(verification.email);
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
